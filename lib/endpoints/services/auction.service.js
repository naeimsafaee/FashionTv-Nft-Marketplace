const { NotFoundError, HumanError, NotAuthorizedError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {
	UserAuctions,
	UserAssignedToken,
	User,
	UserAuctionOffer,
	Setting,
	UserActivity,
	UserToken,
	DiamondTrade,
} = require("../../databases/mongodb");
const statsService = require("./stats.service");

/**
 * add user auctin
 * @param {*} data
 * @param {*} user
 * @returns
 */
function addAuction(
	{ assignTokenId, start, end, basePrice, immediatePrice, bookingPrice, signature, reserveAddress, serial },
	user,
) {
	return new Promise(async (resolve, reject) => {
		// if (!serial)
		//     return reject(new NotFoundError('something went wrong , please try again', 400,));

		const thisUserAssignedToken = await UserAssignedToken.findOne({
			_id: assignTokenId,
			userId: user?.id,
			status: { $in: ["FREE", "NOT_MINTED", "IN_AUCTION"] },
		}).populate("tokenId");
		if (!thisUserAssignedToken) {
			return reject(
				new NotFoundError(
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.MESSAGE,
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.CODE,
				),
			);
		}

		// if (!user[thisUserAssignedToken?.tokenId?.chain?.toLowerCase() + "ApprovedNft"])
		// 	return reject(new NotAuthorizedError(Errors.UNAPPROVED_NFT.MESSAGE, Errors.UNAPPROVED_NFT.CODE));

		if (signature) signature = JSON.parse(signature);

		const result = await UserAuctions.create({
			assignTokenId,
			start,
			end,
			basePrice,
			immediatePrice,
			bookingPrice,
			userId: user?.id,
			signature,
			reserveAddress,
		});

		if (!result) return reject(new HumanError(Errors.AUCTION_ADD_FAILED.MESSAGE, Errors.AUCTION_ADD_FAILED.CODE));

		thisUserAssignedToken.status = "IN_AUCTION";
		await thisUserAssignedToken.save();

		if (immediatePrice) calculateFloorPricw(thisUserAssignedToken?.collectionId, immediatePrice);

		// save user activity
		await UserActivity.create({
			from: user?.id,
			tokenId: thisUserAssignedToken.tokenId,
			collectionId: thisUserAssignedToken.collectionId,
			price: immediatePrice ? immediatePrice : 0,
			type: "LIST",
		});

		// await UserToken.findOneAndUpdate(
		//     {_id: thisUserAssignedToken.tokenId},
		//     {$set: {serialId: serial}},
		// )

		resolve("Successful");
	});
}

/**
 * calaculate fllor price and save it in collection stats
 * @param {*} collectionId
 * @param {*} price
 * @returns
 */
function calculateFloorPricw(collectionId, price) {
	return new Promise(async (resolve, reject) => {
		let floorPrice = await UserAuctions.findOne({
			status: "ACTIVE",
			end: { $gte: Date.now() },
			$and: [{ immediatePrice: { $ne: null } }, { immediatePrice: { $lt: price } }],
		});

		if (!floorPrice) statsService.updateCollectionStats(collectionId, null, price);

		return resolve();
	});
}

/**
 * get auction signature
 * @param {*} id
 * @returns
 */
function getAuction(id) {
	return new Promise(async (resolve, reject) => {
		const result = await UserAuctions.findOne({
			// where: {
			_id: id,
			status: "ACTIVE",
			basePrice: null,
			end: { $gt: Date.now() },
			// start: {$lte: Date.now()},
			// },
		})
			.select("signature")
			.exec();

		if (!result || Date.now() > result?.end)
			return reject(
				new NotFoundError(Errors.USER_AUCTION_NOT_FOUND.MESSAGE, Errors.USER_AUCTION_NOT_FOUND.CODE, { id }),
			);

		return resolve(result?.signature);
	});
}

/**
 * delete user auction and signature
 * @param {*} id
 * @param {*} user
 * @returns
 */
function deleteAuction(id, user) {
	return new Promise(async (resolve, reject) => {
		const result = await UserAuctions.findOneAndUpdate(
			{
				_id: id,
				userId: user?.id,
				status: "ACTIVE",
				immediatePrice: null,
			},
			{ $set: { deletedAt: new Date(), signature: null } },
		);

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_AUCTION_NOT_FOUND.MESSAGE, Errors.USER_AUCTION_NOT_FOUND.CODE, { id }),
			);

		if (result.assignTokenId.tokenId.isLazyMint == true) {
			await UserAssignedToken.findOneAndUpdate(
				{
					userId: user?.id,
					_id: result.assignTokenId,
				},
				{ status: "NOT_MINTED" },
			);
		} else {
			await UserAssignedToken.findOneAndUpdate(
				{ userId: user?.id, _id: result.assignTokenId },
				{ status: "FREE" },
			);
		}

		return resolve("Successful");
	});
}

async function getOneAuction(id) {
	return new Promise(async (resolve, reject) => {
		const currentDate = new Date();

		const query = {
			// start: {$lt: currentDate},
			end: { $gt: currentDate },
			_id: id,
			deletedAt: null,
		};

		const result = await UserAuctions.findOne(query)
			.populate("userId", "-__v")
			.populate({
				path: "assignTokenId",
				select: "-__v",
				populate: [
					{ path: "userId", select: "-__v" },
					{ path: "tokenId", select: "-__v" },
					{
						path: "collectionId",
						select: "-__v",
						populate: {
							path: "category",
							match: { deletedAt: null },
						},
					},
				],
			})
			.lean();

		const bids = await UserAuctionOffer.find({ auctionId: id, deletedAt: null })
			.populate("userId", "username email description image")
			.lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_AUCTION_NOT_FOUND.MESSAGE, Errors.USER_AUCTION_NOT_FOUND.CODE, { id }),
			);

		return resolve({ ...result, bids });
	});
}

function getAllAuction(data) {
	return new Promise(async (resolve, reject) => {
		const {
			page,
			limit,
			order,
			sort,
			userId,
			assignTokenId,
			start,
			end,
			basePrice,
			immediatePrice,
			bookingPrice,
			status,
			createdAt,
		} = data;

		const sortObj = {};
		sortObj[sort || "createdAt"] = order;

		const currentDate = new Date();

		const query = {
			deletedAt: null,
			// start: {$lt: currentDate},
			end: { $gt: currentDate },
		};
		if (userId) query.userId = userId;
		if (assignTokenId) query.collectionId = collectionId;

		if (status) {
			if (!isJson(status)) {
				return reject(
					new HumanError(Errors.INVALID_AUCTION_STATUS.MESSAGE, Errors.INVALID_AUCTION_STATUS.CODE),
				);
			}
			query.status = { $in: JSON.parse(status) };
		}
		if (basePrice) query.basePrice = { $gte: Number(basePrice) };
		if (immediatePrice) query.immediatePrice = { $gte: Number(immediatePrice) };
		if (bookingPrice) query.bookingPrice = { $gte: Number(bookingPrice) };
		if (createdAt) {
			query.createdAt = { $gte: createdAt };
		}
		const count = await UserAuctions.countDocuments(query);
		const items = await UserAuctions.find(query)
			.populate("userId", "-__v")
			.populate({
				path: "assignTokenId",
				select: "-__v",
				populate: [
					{ path: "userId", select: "-__v" },
					{ path: "tokenId", select: "-__v" },
					{
						path: "collectionId",
						select: "-__v",
						populate: {
							path: "category",
							match: { deletedAt: null },
						},
					},
				],
			})
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: items,
		});
	});
}

function auctionSelector(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, searchQuery } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;

		const currentDate = new Date();

		const query = {
			deletedAt: null,
			// start: {$lt: currentDate},
			end: { $gt: currentDate },
		};

		if (searchQuery) {
			query["$or"] = [
				{
					"userId.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"assignTokenId.tokenId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"assignTokenId.collectionId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const count = await UserAuctions.countDocuments(query);
		const result = await UserAuctions.find(query)
			.populate("userId", "-__v")
			.populate({
				path: "assignTokenId",
				select: "-__v",
				populate: [
					{ path: "userId", select: "-__v" },
					{ path: "tokenId", select: "-__v" },
					{
						path: "collectionId",
						select: "-__v",
						populate: {
							path: "category",
							match: { deletedAt: null },
						},
					},
				],
			})
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: result,
		});
	});
}

async function getOneAuctionByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await UserAuctions.findById(id)
			.populate("userId", "-__v")
			.populate({
				path: "assignTokenId",
				select: "-__v",
				populate: [
					{ path: "userId", select: "-__v" },
					{ path: "tokenId", select: "-__v" },
					{
						path: "collectionId",
						select: "-__v",
						populate: {
							path: "category",
							match: { deletedAt: null },
						},
					},
				],
			})
			.lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_AUCTION_NOT_FOUND.MESSAGE, Errors.USER_AUCTION_NOT_FOUND.CODE, { id }),
			);

		return resolve(result);
	});
}

function getAllAuctionByManager(data) {
	return new Promise(async (resolve, reject) => {
		const {
			page,
			limit,
			order,
			sort,
			user,
			token,
			collection,
			basePrice,
			immediatePrice,
			bookingPrice,
			status,
			start,
			end,
			searchQuery,
		} = data;

		const query = {
			deletedAt: null,
		};

		// Auction
		if (status) {
			query.status = { $in: status };
		}
		if (start) {
			const startDate = new Date(start);
			query.start = { $gt: startDate };
		}
		if (end) {
			const endDate = new Date(end);
			query.end = { $lt: endDate };
		}

		if (basePrice) query.basePrice = { $gte: Number(basePrice) };
		if (immediatePrice) query.immediatePrice = { $gte: Number(immediatePrice) };
		if (bookingPrice) query.bookingPrice = { $gte: Number(bookingPrice) };

		if (searchQuery) {
			query["$or"] = [
				{
					"tokenId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"collectionId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"userId.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"userId.address": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		// Token
		if (token) {
			query["tokenId.name"] = {
				$regex: token || "",
				$options: "i",
			};
		}

		// User
		if (user) {
			query["$or"] = [
				{
					"userId.address": {
						$regex: user || "",
						$options: "i",
					},
				},
				{
					"userId.username": {
						$regex: user || "",
						$options: "i",
					},
				},
			];
		}

		// Collection
		if (collection) {
			query["collectionId.name"] = {
				$regex: collection || "",
				$options: "i",
			};
		}

		let sortObject = { [sort]: order === "DESC" ? -1 : 1 };
		if (sort === "token") {
			sortObject = { ["tokenId.name"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "user") {
			sortObject = { /* ["userFieldType"]: -1, */ ["userId.username"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "collection") {
			sortObject = { ["collection.name"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "basePrice") {
			sortObject = { ["basePriceFieldType"]: -1, ["basePrice"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "immediatePrice") {
			sortObject = { ["immediatePriceFieldType"]: -1, ["immediatePrice"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "bookingPrice") {
			sortObject = { ["bookingPriceFieldType"]: -1, ["bookingPrice"]: order === "DESC" ? -1 : 1 };
		}

		const result = await UserAuctions.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userId",
				},
			},
			{ $unwind: "$userId" },
			{
				$lookup: {
					from: "userAssignedTokens",
					localField: "assignTokenId",
					foreignField: "_id",
					as: "assignTokenId",
				},
			},
			{ $unwind: "$assignTokenId" },
			{
				$lookup: {
					from: "userTokens",
					localField: "assignTokenId.tokenId",
					foreignField: "_id",
					as: "tokenId",
				},
			},
			{ $unwind: "$tokenId" },
			{
				$lookup: {
					from: "userCollections",
					localField: "tokenId.collectionId",
					foreignField: "_id",
					as: "collectionId",
				},
			},
			{ $unwind: "$collectionId" },
			{ $match: query },
			{
				$addFields: {
					// userFieldType: {
					// 			$cond: [
					// 				{
					// 					$ifNull: ["$userId.username", false],
					// 				},
					// 				{ $type: "$userId.username" },
					// 				"null",
					// 			],
					// 		},
					basePriceFieldType: {
						$cond: [
							{
								$ifNull: ["$basePrice", false],
							},
							{ $type: "$basePrice" },
							null,
						],
					},
					immediatePriceFieldType: {
						$cond: [
							{
								$ifNull: ["$immediatePrice", false],
							},
							{ $type: "$immediatePrice" },
							null,
						],
					},
					bookingPriceFieldType: {
						$cond: [
							{
								$ifNull: ["$bookingPrice", false],
							},
							{ $type: "$bookingPrice" },
							null,
						],
					},
				},
			},

			{ $sort: sortObject },
			{ $project: { basePriceFieldType: 0, immediatePriceFieldType: 0, bookingPriceFieldType: 0 } },
			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]).collation({ locale: "en" });

		const items = result[0].data;
		const metadata = result[0].metadata[0];

		// userId is The user that made the auction
		const mappedData = items.map(({ assignTokenId, tokenId, userId, collectionId, ...rest }) => {
			return {
				...rest,
				userId,
				assignTokenId: {
					...assignTokenId,
					tokenId,
					collectionId,
				},
			};
		});

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: mappedData,
		});
	});
}

function auctionSelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, searchQuery, currentDate } = data;

		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
			// start: {$lt: currentDate},
			end: { $gt: currentDate },
		};
		if (searchQuery) {
			query["$or"] = [
				{
					"userId.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"assignTokenId.tokenId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"assignTokenId.collectionId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const count = await UserAuctions.countDocuments(query);
		const result = await UserAuctions.find(query)
			.populate("userId", "-__v")
			.populate({
				path: "assignTokenId",
				select: "-__v",
				populate: [
					{ path: "userId", select: "-__v" },
					{ path: "tokenId", select: "-__v" },
					{
						path: "collectionId",
						select: "-__v",
						populate: {
							path: "category",
							match: { deletedAt: null },
						},
					},
				],
			})
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: result,
		});
	});
}

/**
 * get auction settings
 * @param {*} data
 * @returns
 */
function getSettings(data) {
	return new Promise(async (resolve, reject) => {
		// declear auction fee for system
		let amount = 0,
			address = null;

		let settings = await Setting.find({ key: { $in: ["AUCTION_FEE_AMOUNT", "AUCTION_FEE_ADDRESS"] } });

		for (const setting of settings) {
			if (key === "AUCTION_FEE_AMOUNT") amount = setting.value;

			if (key === "AUCTION_FEE_ADDRESS") address = setting.value;
		}

		return resolve({ amount, address });
	});
}

/**
 * get auction trades list
 */
async function getAuctionTradesManager(data) {
	let query = {};
	const {
		id,
		auctionId,
		payerId,
		payeeId,
		cardTypeId,
		page,
		limit,
		order,
		createdAt,
		payer,
		payee,
		amount,
		fee,
		searchQuery,
		userId,
		diamondId,
		diamondTypeId,
	} = data;
	return new Promise(async (resolve, reject) => {
		let sort = {};
		if (id) query.id = id;

		if (auctionId) query.auctionId = auctionId;
		query.deletedAt = null;

		if (payerId) query.payerId = payerId;

		if (payeeId) query.payeeId = payeeId;
		if (amount) query.amount = amount;
		if (fee) query.fee = fee;
		if (diamondId) {
			query = { "auctionId.diamondId.name": new RegExp(diamondId, "i") };
		}

		if (diamondTypeId) {
			query = { "auctionId.diamondTypeId.name": { $in: [...diamondTypeId] } };
		}

		// if (payer) query2.name = { [postgres.Op.iLike]: "%" + payer + "%" };
		// if (payee) query3.name = { [postgres.Op.iLike]: "%" + payee + "%" };

		//sort
		if (order == "DESC") {
			sort.createdAt = -1;
		} else if (order == "ASC") {
			sort.createdAt = +1;
		}

		if (searchQuery) {
			query["$or"] = [
				{
					"payeeId.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					title: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const result = await DiamondTrade.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "payeeId",
					foreignField: "_id",
					as: "payeeId",
				},
			},
			{ $unwind: { path: "$payeeId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "users",
					localField: "payerId",
					foreignField: "_id",
					as: "payerId",
				},
			},
			{ $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "auctions",
					localField: "auctionId",
					foreignField: "_id",
					as: "auctionId",
				},
			},
			{ $unwind: { path: "$auctionId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "diamonds",
					localField: "auctionId.diamondId",
					foreignField: "_id",
					as: "auctionId.diamondId",
				},
			},
			{ $unwind: { path: "$auctionId.diamondId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "diamondTypes",
					localField: "auctionId.diamondTypeId",
					foreignField: "_id",
					as: "auctionId.diamondTypeId",
				},
			},
			{ $unwind: { path: "$auctionId.diamondTypeId", preserveNullAndEmptyArrays: true } },
			{ $match: query },
			{ $sort: sort },
			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]).collation({ locale: "en" });

		const items = result[0].data;
		const metadata = result[0].metadata[0];

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});

		// let offset = (page - 1) * limit;

		// const count = await DiamondTrade.countDocuments(query);
		// let result = await DiamondTrade.find(query)
		// 	.populate({ path: "payerId" })
		// 	.populate({ path: "payeeId" })
		// 	.populate({ path: "auctionId" })
		// 	.select("-__v")
		// 	.sort({ createdAt: "DESC" })
		// 	.skip((page - 1) * limit)
		// 	.limit(limit)
		// 	.lean();

		// resolve({
		// 	total: count ?? 0,
		// 	pageSize: limit,
		// 	page,
		// 	data: result,
		// });
	});
}

async function getAuctionTradeManager(id) {
	let result = await DiamondTrade.findOne({ _id: id, deletedAt: null })
		.populate({ path: "payerId" })
		.populate({ path: "payeeId" })
		.populate({ path: "auctionId" });

	return result;
}

module.exports = {
	getSettings,
	addAuction,
	getAuction,
	deleteAuction,
	getOneAuction,
	getAllAuction,
	auctionSelector,
	getOneAuctionByManager,
	getAllAuctionByManager,
	auctionSelectorByManager,
	getAuctionTradesManager,
	getAuctionTradeManager,
};

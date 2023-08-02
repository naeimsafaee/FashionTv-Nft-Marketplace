const { NotFoundError, HumanError, ConflictError, NotAuthorizedError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {
	UserAuctionOffer,
	UserAuctions,
	UserAssignedToken,
	UserToken,
	UserActivity,
	UserApproval,
} = require("../../databases/mongodb");
const utils = require("web3-utils");

const ObjectId = require("mongoose").Types.ObjectId;

const socketService = require("./socket.service");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

/**
 * add auction bid or make offer
 * @param {*} data
 * @param {*} user
 * @returns
 */
function addAuctionOffer({ auctionId, amount, assignedTokenId, expiresAt, signature }, user) {
	return new Promise(async (resolve, reject) => {
		let entity, tokenId, collectionId;

		if (auctionId) {
			entity = await UserAuctions.findOne({
				_id: auctionId,
				status: "ACTIVE",
				end: { $gt: Date.now() },
				start: { $lte: Date.now() },
			}).populate({
				path: "assignTokenId",
				populate: { path: "tokenId" },
			});

			if (!entity)
				return reject(
					new NotFoundError(Errors.USER_AUCTION_NOT_FOUND.MESSAGE, Errors.USER_AUCTION_NOT_FOUND.CODE),
				);

			// if (!user[entity?.assignTokenId?.tokenId?.chain?.toLowerCase() + "ApprovedWallet"])
			//     return reject(new NotAuthorizedError(Errors.UNAPPROVED_WALLET.MESSAGE, Errors.UNAPPROVED_WALLET.CODE));

			if (amount < entity?.basePrice ?? 0) {
				return reject(
					new HumanError(
						Errors.USER_AUCTION_OFFER_AMOUNT_IS_LOWER_THAN_BASEPRICE.MESSAGE,
						Errors.USER_AUCTION_OFFER_AMOUNT_IS_LOWER_THAN_BASEPRICE.CODE,
					),
				);
			}

			tokenId = entity?.assignTokenId?.tokenId?.id;
			collectionId = entity?.assignTokenId?.collectionId;
		}

		if (assignedTokenId) {
			entity = await UserAssignedToken.findOne({
				_id: assignedTokenId,
				status: { $in: ["FREE", "IN_AUCTION"] },
			}).populate("tokenId");

			// if (!user[entity?.tokenId?.chain?.toLowerCase() + "ApprovedWallet"])
			//     return reject(new NotAuthorizedError(Errors.UNAPPROVED_WALLET.MESSAGE, Errors.UNAPPROVED_WALLET.CODE));

			if (!entity)
				return reject(
					new NotFoundError(
						Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.MESSAGE,
						Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.CODE,
					),
				);

			tokenId = entity?.tokenId?.id;
			collectionId = entity?.collectionId;
		}

		if (!entity || entity?.userId == user.id)
			return reject(new ConflictError(Errors.SAME_OWNER.MESSAGE, Errors.SAME_OWNER.CODE));

		// check user balance and approved amount
		// let approval = await UserApproval.findOne({userId: user.id});
		//
		// if (!approval)
		//     return reject(new NotAuthorizedError(Errors.UNAPPROVED_WALLET.MESSAGE, Errors.UNAPPROVED_WALLET.CODE));

		// let oldAmountOffers = utils.toBN(approval.amountOffers),
		//     amountApproved = utils.toBN(approval.amountApproved),
		// let amountBN = utils.toBN(utils.toWei(amount.toString(), "ether"))
		// let newAmountOffers = oldAmountOffers.add(amountBN)
		// let balance = utils.toBN(approval.balance);

		// if (newAmountOffers.gt(amountApproved))
		//     return reject(
		//         new NotAuthorizedError(Errors.AMOUNT_APPROVER_IS_LOW.MESSAGE, Errors.AMOUNT_APPROVER_IS_LOW.CODE),
		//     );

		// if (newAmountOffers.gt(balance))
		//     return reject(
		//         new NotAuthorizedError(Errors.WALLET_BALANCE_IS_LOW.MESSAGE, Errors.WALLET_BALANCE_IS_LOW.CODE),
		//     );

		if (signature) signature = JSON.parse(signature);

		const result = await UserAuctionOffer.create({
			auctionId,
			assignedTokenId,
			amount,
			expiresAt,
			signature,
			userId: user.id,
		});

		if (!result)
			return reject(
				new HumanError(Errors.USER_AUCTION_OFFER_FAILED.MESSAGE, Errors.USER_AUCTION_OFFER_FAILED.CODE),
			);

		// await approval.update({amountOffers: newAmountOffers});

		// save user activity
		await UserActivity.create({
			from: user?.id,
			to: entity?.userId,
			tokenId,
			collectionId,
			price: amount,
			type: auctionId ? "BID" : "OFFER",
		});

		// await socketService.emitBidEvent(result.toObject());

		resolve("Successful");
	});
}

function editAuctionOffer(id, auctionId, amount, user) {
	return new Promise(async (resolve, reject) => {
		// if (!user.approvedWallet) {
		//     return reject(new NotAuthorizedError(Errors.UNAPPROVED_WALLET.MESSAGE, Errors.UNAPPROVED_WALLET.CODE));
		// }
		const thisUserAuctionOffer = await UserAuctionOffer.findOne({ _id: id, userId: user.id }).lean();
		if (!thisUserAuctionOffer) {
			return reject(
				new NotFoundError(
					Errors.USER_AUCTION_OFFER_NOT_FOUND.MESSAGE,
					Errors.USER_AUCTION_OFFER_NOT_FOUND.CODE,
				),
			);
		}

		let update = {};

		const thisAuction = await UserAuctions.findOne({ _id: auctionId || thisUserAuctionOffer.id, deletedAt: null });
		if (auctionId) {
			if (!thisAuction) {
				return reject(
					new NotFoundError(Errors.USER_AUCTION_NOT_FOUND.MESSAGE, Errors.USER_AUCTION_NOT_FOUND.CODE),
				);
			}

			update.auctionId = auctionId;
		}
		if (amount) {
			if (+amount < +thisAuction.basePrice) {
				return reject(
					new HumanError(
						Errors.USER_AUCTION_OFFER_AMOUNT_IS_LOWER_THAN_BASEPRICE.MESSAGE,
						Errors.USER_AUCTION_OFFER_AMOUNT_IS_LOWER_THAN_BASEPRICE.CODE,
					),
				);
			}
			update.amount = amount;
		}

		const currentDate = new Date();
		if (+currentDate < +thisAuction.start) {
			return reject(
				new HumanError(Errors.USER_AUCTION_IS_NOT_STARTED.MESSAGE, Errors.USER_AUCTION_IS_NOT_STARTED.CODE),
			);
		}

		if (+currentDate > +thisAuction.end) {
			return reject(new HumanError(Errors.USER_AUCTION_IS_ENDED.MESSAGE, Errors.USER_AUCTION_IS_ENDED.CODE));
		}

		const result = await UserAuctionOffer.findOneAndUpdate({ _id: id, userId: user.id }, update);

		if (!result)
			return reject(new NotFoundError(Errors.USER_AUCTION_NOT_FOUND.MESSAGE, Errors.BLOG_NOT_FOUND.CODE, { id }));

		return resolve("Successful");
	});
}

/**
 * delete auction offers
 * @param {*} id
 * @param {*} user
 * @returns
 */
function deleteAuctionOffer(id, user) {
	return new Promise(async (resolve, reject) => {
		const result = await UserAuctionOffer.findOneAndUpdate(
			{ _id: id, userId: user._id },
			{ $set: { deletedAt: new Date(), signature: null } },
		);

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_AUCTION_NOT_FOUND.MESSAGE, Errors.USER_AUCTION_NOT_FOUND.CODE, { id }),
			);

		return resolve("Successful");
	});
}

/**
 * get offer signature
 * @param {*} id
 * @returns
 */
async function getOneAuctionOffer(id) {
	return new Promise(async (resolve, reject) => {
		const result = await UserAuctionOffer.findOne({
			_id: id,
			status: "REGISTER",
			expiresAt: { $gt: Date.now() },
		})
			.select("signature")
			.exec();

		if (!result)
			return reject(
				new NotFoundError(
					Errors.USER_AUCTION_OFFER_NOT_FOUND.MESSAGE,
					Errors.USER_AUCTION_OFFER_NOT_FOUND.CODE,
					{ id },
				),
			);

		return resolve(result?.signature);
	});
}

function auctionSelectorOffer(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, searchQuery } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			expiresAt: { $gt: Date.now() },
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

		const count = await UserAuctionOffer.countDocuments(query);
		const result = await UserAuctionOffer.find(query)
			.populate("userId", "-__v")
			.populate({
				path: "auctionId",
				select: "-__v",
				populate: {
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
				},
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

async function getOneAuctionOfferByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await UserAuctionOffer.findById(id)
			.populate("userId", "-__v")
			.populate({
				path: "auctionId",
				select: "-__v",
				populate: {
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
				},
			})
			.lean();

		if (!result)
			return reject(
				new NotFoundError(
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.MESSAGE,
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.CODE,
					{ id },
				),
			);

		return resolve(result);
	});
}

function getUserOffers(data, user) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
			userId: user.id,
			assignedTokenId: { $ne: null },
			auctionId: null,
			expiresAt: { $gt: new Date() },
		};

		const count = await UserAuctionOffer.countDocuments(query);
		const items = await UserAuctionOffer.find(query)
			.populate([
				{
					path: "assignedTokenId",
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
				},
				{
					path: "userId",
					model: "users",
				},
			])
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

function getUserOffersOthers(data, user) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
			userId: user.id,
			// assignedTokenId: { $ne: null },
			// auctionId: null,
			expiresAt: { $gt: new Date() },
		};

		const count = await UserAuctionOffer.countDocuments(query);
		const items = await UserAuctionOffer.find(query)
			.populate([
				{
					path: "assignedTokenId",
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
				},
				{
					path: "userId",
					model: "users",
				},
			])
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

function getAllAuctionOfferByManager(data) {
	return new Promise(async (resolve, reject) => {
		const {
			page,
			limit,
			order,
			sort,
			amount,
			status,
			auctionStatus,
			collection,
			token,
			user,
			type,
			createdAt,
			searchQuery,
		} = data;

		const query = {
			deletedAt: null,
		};
		// let addfield = {};

		if (type == "auction") {
			query["auctionId.assignTokenId"] = { $ne: {} };
		}

		if (type == "assignedToken") {
			query.assignedTokenId = { $ne: {} };
		}

		// Offer
		if (status) query.status = { $in: status };
		if (amount) query.amount = { $gte: Number(amount) };
		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		// Auction
		if (auctionStatus) query["auctionId.status"] = { $in: auctionStatus };

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
			query["$or"] = [
				{
					"auctionId.assignTokenId.collectionId.name": {
						$regex: collection || "",
						$options: "i",
					},
				},
				{
					"assignedTokenId.collectionId.name": {
						$regex: collection || "",
						$options: "i",
					},
				},
			];
		}

		// Token
		if (token) {
			query["$or"] = [
				{
					"auctionId.assignTokenId.tokenId.name": {
						$regex: token || "",
						$options: "i",
					},
				},
				{
					"assignedTokenId.tokenId.name": {
						$regex: token || "",
						$options: "i",
					},
				},
			];
		}

		if (searchQuery) {
			query["$or"] = [
				{
					"auctionId.assignTokenId.tokenId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"assignedTokenId.tokenId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"auctionId.assignTokenId.collectionId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"assignedTokenId.collectionId.name": {
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

		let sortObject = { [sort]: order === "DESC" ? -1 : 1 };
		if (sort === "token") {
			sortObject = {
				["assignedTokenId.tokenId.name"]: order === "DESC" ? -1 : 1,
				["auctionId.assignTokenId.tokenId.name"]: order === "DESC" ? -1 : 1,
			};
		}

		if (sort === "user") {
			sortObject = { /* ["userFieldType"]: -1, */ ["userId.username"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "collection") {
			sortObject = {
				["assignedTokenId.collectionId.name"]: order === "DESC" ? -1 : 1,
				["auctionId.assignTokenId.collectionId.name"]: order === "DESC" ? -1 : 1,
			};
		}

		if (sort === "auctionStatus") {
			sortObject = { ["auctionId.status"]: order === "DESC" ? -1 : 1 };
		}

		const result = await UserAuctionOffer.aggregate([
			{
				$lookup: {
					from: "userAuctions",
					localField: "auctionId",
					foreignField: "_id",
					as: "auctionId",
				},
			},
			{ $unwind: { path: "$auctionId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "userAssignedTokens",
					localField: "auctionId.assignTokenId",
					foreignField: "_id",
					as: "auctionId.assignTokenId",
				},
			},
			{ $unwind: { path: "$auctionId.assignTokenId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "userTokens",
					localField: "auctionId.assignTokenId.tokenId",
					foreignField: "_id",
					as: "auctionId.assignTokenId.tokenId",
				},
			},
			{ $unwind: { path: "$auctionId.assignTokenId.tokenId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "userCollections",
					localField: "auctionId.assignTokenId.tokenId.collectionId",
					foreignField: "_id",
					as: "auctionId.assignTokenId.collectionId",
				},
			},
			{ $unwind: { path: "$auctionId.assignTokenId.collectionId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "userAssignedTokens",
					localField: "assignedTokenId",
					foreignField: "_id",
					as: "assignedTokenId",
				},
			},
			{ $unwind: { path: "$assignedTokenId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "userTokens",
					localField: "assignedTokenId.tokenId",
					foreignField: "_id",
					as: "assignedTokenId.tokenId",
				},
			},
			{ $unwind: { path: "$assignedTokenId.tokenId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "userCollections",
					localField: "assignedTokenId.collectionId",
					foreignField: "_id",
					as: "assignedTokenId.collectionId",
				},
			},
			{ $unwind: { path: "$assignedTokenId.collectionId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userId",
				},
			},
			{ $unwind: "$userId" },
			{ $match: query },
			//	{ $addFields: addfield },
			// {
			// $addFields: {
			// userFieldType: {
			// 			$cond: [
			// 				{
			// 					$ifNull: ["$userId.username", false],
			// 				},
			// 				{ $type: "$userId.username" },
			// 				"null",
			// 			],
			// 		},
			// },
			// },
			{ $sort: sortObject },
			// { $project: { userFieldType: 0 } },
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
		// const mappedData = items.map(({ auctiondId, assignedTokenId, ...rest }) => {
		// 	return {
		// 		...rest,
		// 		auctiondId,
		// 		assignedTokenId,
		// 	};
		// });

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});
	});
}

function auctionOfferSelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, searchQuery } = data;
		const query = { "auctionId.assignTokenId.collectionId.deletedAt": null };

		if (searchQuery) {
			query["$or"] = [
				{
					"userId.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"auctionId.assignTokenId.tokenId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"auctionId.assignTokenId.collectionId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}
		let sortObject = { [sort]: order === "DESC" ? -1 : 1 };

		// const result = await UserAuctionOffer.aggregate([
		//     {
		//         $lookup: {
		//             from: "userAuctions",
		//             localField: "auctionId",
		//             foreignField: "_id",
		//             as: "auctionId",
		//         },
		//     },
		//     {$unwind: {path: "$auctionId", preserveNullAndEmptyArrays: true}},
		//     {
		//         $lookup: {
		//             from: "userAssignedTokens",
		//             localField: "auctionId.assignTokenId",
		//             foreignField: "_id",
		//             as: "auctionId.assignTokenId",
		//         },
		//     },
		//     {$unwind: {path: "$auctionId.assignTokenId", preserveNullAndEmptyArrays: true}},
		//     {
		//         $lookup: {
		//             from: "userTokens",
		//             localField: "auctionId.assignTokenId.tokenId",
		//             foreignField: "_id",
		//             as: "auctionId.assignTokenId.tokenId",
		//         },
		//     },
		//     {$unwind: {path: "$auctionId.assignTokenId.tokenId", preserveNullAndEmptyArrays: true}},
		//     {
		//         $lookup: {
		//             from: "userCollections",
		//             localField: "auctionId.assignTokenId.tokenId.collectionId",
		//             foreignField: "_id",
		//             as: "auctionId.assignTokenId.collectionId",
		//         },
		//     },
		//     {$unwind: {path: "$auctionId.assignTokenId.collectionId", preserveNullAndEmptyArrays: true}},
		//     {
		//         $lookup: {
		//             from: "userAssignedTokens",
		//             localField: "assignedTokenId",
		//             foreignField: "_id",
		//             as: "assignedTokenId",
		//         },
		//     },
		//     {$unwind: {path: "$assignedTokenId", preserveNullAndEmptyArrays: true}},
		//     {
		//         $lookup: {
		//             from: "userTokens",
		//             localField: "assignedTokenId.tokenId",
		//             foreignField: "_id",
		//             as: "assignedTokenId.tokenId",
		//         },
		//     },
		//     {$unwind: {path: "$assignedTokenId.tokenId", preserveNullAndEmptyArrays: true}},
		//     {
		//         $lookup: {
		//             from: "userCollections",
		//             localField: "assignedTokenId.collectionId",
		//             foreignField: "_id",
		//             as: "assignedTokenId.collectionId",
		//         },
		//     },
		//     {$unwind: {path: "$assignedTokenId.collectionId", preserveNullAndEmptyArrays: true}},
		//     {
		//         $lookup: {
		//             from: "users",
		//             localField: "userId",
		//             foreignField: "_id",
		//             as: "userId",
		//         },
		//     },
		//     {$unwind: "$userId"},
		//     {$match: query},
		//     // {
		//     // $addFields: {
		//     // userFieldType: {
		//     // 			$cond: [
		//     // 				{
		//     // 					$ifNull: ["$userId.username", false],
		//     // 				},
		//     // 				{ $type: "$userId.username" },
		//     // 				"null",
		//     // 			],
		//     // 		},
		//     // },
		//     // },
		//     {$sort: sortObject},
		//     // { $project: { userFieldType: 0 } },
		//     {
		//         $facet: {
		//             metadata: [{$count: "total"}, {$addFields: {page}}],
		//             data: [{$skip: (page - 1) * limit}, {$limit: limit}],
		//         },
		//     },
		// ]).collation({locale: "en"});

		const result = await UserAuctionOffer.aggregate([
			{
				$lookup: {
					from: "userAuctions",
					localField: "auctionId",
					foreignField: "_id",
					as: "auctionId",
				},
			},
			{ $unwind: { path: "$auctionId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "userAssignedTokens",
					localField: "auctionId.assignTokenId",
					foreignField: "_id",
					as: "auctionId.assignTokenId",
				},
			},
			{ $unwind: { path: "$auctionId.assignTokenId" } },
			{
				$lookup: {
					from: "userTokens",
					localField: "auctionId.assignTokenId.tokenId",
					foreignField: "_id",
					as: "auctionId.assignTokenId.tokenId",
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "auctionId.assignTokenId.userId",
					foreignField: "_id",
					as: "auctionId.assignTokenId.userId",
				},
			},
			{ $unwind: { path: "$auctionId.assignTokenId" } },
			{
				$lookup: {
					from: "userCollections",
					localField: "auctionId.assignTokenId.collectionId",
					foreignField: "_id",
					as: "auctionId.assignTokenId.collectionId",
				},
			},
			{
				$lookup: {
					from: "categories",
					localField: "auctionId.assignTokenId.collectionId.category",
					foreignField: "_id",
					as: "auctionId.assignTokenId.collectionId.categoryId",
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userId",
				},
			},
			// {$unwind: "$userId"},
			{ $match: query },
			// {
			// $addFields: {
			// userFieldType: {
			// 			$cond: [
			// 				{
			// 					$ifNull: ["$userId.username", false],
			// 				},
			// 				{ $type: "$userId.username" },
			// 				"null",
			// 			],
			// 		},
			// },
			// },
			{ $sort: sortObject },
			// { $project: { userFieldType: 0 } },
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
		// const mappedData = items.map(({ auctiondId, assignedTokenId, ...rest }) => {
		// 	return {
		// 		...rest,
		// 		auctiondId,
		// 		assignedTokenId,
		// 	};
		// });

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});

		// const count = await UserAuctionOffer.countDocuments(query);
		// const result = await UserAuctionOffer.find(query)
		//     .populate("userId", "-__v")
		//     .populate({
		//         path: "auctionId",
		//         select: "-__v",
		//         populate: {
		//             path: "assignTokenId",
		//             select: "-__v",
		//             populate: [
		//                 {path: "userId", select: "-__v"},
		//                 {path: "tokenId", select: "-__v"},
		//                 {
		//                     path: "collectionId",
		//                     select: "-__v",
		//                     populate: {
		//                         path: "category",
		//                         match: {deletedAt: null},
		//                     },
		//                 },
		//             ],
		//         },
		//     })
		//     .select("-__v")
		//     .sort(sortObj)
		//     .skip((page - 1) * limit)
		//     .limit(limit)
		//     .lean();

		// resolve({
		//     total: count ?? 0,
		//     pageSize: limit,
		//     page,
		//     data: result,
		// });
	});
}

module.exports = {
	addAuctionOffer,
	editAuctionOffer,
	deleteAuctionOffer,
	getOneAuctionOffer,
	auctionSelectorOffer,
	getOneAuctionOfferByManager,
	getAllAuctionOfferByManager,
	auctionOfferSelectorByManager,
	getUserOffers,
	getUserOffersOthers,
};

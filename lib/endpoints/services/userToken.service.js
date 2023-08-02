const { NFTStorage, File, Blob } = require("nft.storage");
const sharp = require("sharp");
const { NotFoundError, HumanError, NotAuthorizedError, ConflictError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {
	UserToken,
	UserCollection,
	UserAssignedToken,
	UserAuctions,
	UserAuctionOffer,
	Setting,
	UserExplore,
	User,
	UserActivity,
	ContractAddress,
	UserFollowLike,
	UserDiamond,
} = require("../../databases/mongodb");
const config = require("config");
const axios = require("axios");
const Web3 = require("web3");
const { s3Uploader } = require("../../middlewares");
const { v4: uuidV4, stringify } = require("uuid");
const { isJson } = require("../../utils");
const { randomSerial, computeTokenIdFromMetadata } = require("../../utils/randomSerial");
const Stats = require("./stats.service");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

const ipfsApiKey = config.get("ipfs.apiKey");

const ipfsClient = new NFTStorage({ token: ipfsApiKey });

const ObjectId = require("mongoose").Types.ObjectId;

const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

function addToken(
	name,
	description,
	supply,
	chain,
	unblockableContent,
	url,
	explicitContent,
	properties,
	files,
	collectionId,
	user,
	fileValidationError,
	isLazyMint,
) {
	return new Promise(async (resolve, reject) => {
		// const existToken = await UserToken.findOne({ name, deletedAt: null /* collectionId */ });
		// if (existToken) {
		// 	return reject(new HumanError(Errors.DUPLICATE_TOKEN.MESSAGE, Errors.DUPLICATE_TOKEN.CODE));
		// }

		if (collectionId) {
			const thisCollcetion = await UserCollection.findOne({ _id: collectionId, user: user.id });
			if (!thisCollcetion) {
				return reject(
					new NotFoundError(Errors.USER_COLLECTION_NOT_FOUND.MESSAGE, Errors.USER_COLLECTION_NOT_FOUND.CODE),
				);
			}
		}

		if (fileValidationError) {
			return reject(
				new ConflictError(Errors.FILE_NOT_SUPPORTED.MESSAGE, Errors.FILE_NOT_SUPPORTED.CODE, {
					fileValidationError,
				}),
			);
		}

		// if (!user.isVerified) {
		// 	return reject(
		// 		new NotAuthorizedError(Errors.YOU_ARE_NOT_VERIFIED.MESSAGE, Errors.YOU_ARE_NOT_VERIFIED.CODE),
		// 	);
		// }

		if (properties) {
			if (!isJson(properties)) {
				return reject(new ConflictError(Errors.INVALID_PROPERTIES.MESSAGE, Errors.INVALID_PROPERTIES.CODE));
			}
		}

		if (!files.nftFile) {
			return reject(new ConflictError(Errors.NFT_FILE_UPLOAD_ERROR.MESSAGE, Errors.NFT_FILE_UPLOAD_ERROR.CODE));
		}

		const mime = files.nftFile[0].mimetype.split("/")[0];
		// if ((mime == "audio" || mime == "video" || mime == "model") && !files.previewImage) {
		// 	return reject(
		// 		new ConflictError(
		// 			Errors.NFT_PREVIEW_FILE_UPLOAD_ERROR.MESSAGE,
		// 			Errors.NFT_PREVIEW_FILE_UPLOAD_ERROR.CODE,
		// 		),
		// 	);
		// }

		if (!files.previewImage) {
			return reject(
				new ConflictError(
					Errors.NFT_PREVIEW_FILE_UPLOAD_ERROR.MESSAGE,
					Errors.NFT_PREVIEW_FILE_UPLOAD_ERROR.CODE,
				),
			);
		}

		let thisFile;
		let thumbnailFile;
		let thisFileType;

		// Making Thumbnail
		// if (mime == "image") {
		// 	thisFile = files.nftFile[0];
		// 	thisFileType = files.nftFile[0].originalname.split(".").pop();
		// } else { }

		const thumbnailBuffer = files?.previewImageBuffer;
		thisFile = files.previewImage;
		thisFileType = files.previewImage.newName.split(".").pop();

		// const thisFileName = thisFile.newName.replace("." + thisFileType, "-thumb") + "." + thisFileType;
		thumbnailFile = new File([thumbnailBuffer], files.previewImage.newName, {
			//			type: files.previewImage.contentType,
			type: files.previewImage.mimetype,
		});

		const mainNftFile = new File([files.nftFile[0].buffer], files.nftFile[0].originalname, {
			type: files.nftFile[0].mimetype,
		});

		const mainNftFileProperties = {};
		mainNftFileProperties["main_file"] = mainNftFile;
		const propery = properties ? JSON.parse(properties) : null;

		// let formatedProperties = [];
		// formatedProperties = Object?.keys(propery).map((key) => {
		// 	return {
		// 		title: key,
		// 		values: propery[key],
		// 	};
		// });

		let formatedProperties = [];
		if (properties) {
			Object.keys(propery).map((key) => {
				const existIndex = formatedProperties.findIndex((ft) => ft.title.trim() == key.trim());
				if (existIndex > -1) {
					formatedProperties[existIndex].values = formatedProperties[existIndex].values.concat([
						...new Set(propery[key].map((value) => value.trim())),
					]);
				} else {
					formatedProperties.push({
						title: key.trim(),
						values: [...new Set(propery[key].map((value) => value.trim()))],
					});
				}
			});
		}

		const metadataAttr = [];

		formatedProperties.forEach((property) => {
			for (let i = 0; i < property.values.length; i++) {
				metadataAttr.push({
					trait_type: property.title,
					value: property.values[i],
				});
			}
		});

		let nftProperties = {
			name,
			description,
			external_url: url,
			mimetype: files.nftFile[0].mimetype,
			image: thumbnailFile,
			attributes: metadataAttr,
			...mainNftFileProperties,
		};

		let metadata = await ipfsClient.store(nftProperties);

		const thisFee = await Setting.findOne({ key: "MINT_FEE_" + chain }).lean();
		const thisFeeAmount = thisFee ? Number(thisFee.value) : 0;

		// console.log({metadata})

		// const href = metadata.data.image.href;
		const serialId = Web3.utils.hexToNumberString(computeTokenIdFromMetadata(metadata.url, user.address));

		const thumbnailNew = {
			name: files.previewImage.newName,
			key: files.previewImage.key,
			location: files.previewImage.location,
		};

		const mainFileNew = {
			name: files.nftMainFile.newName,
			key: files.nftMainFile.key,
			location: files.nftMainFile.location,
		};

		const result = await UserToken.create({
			name,
			description,
			ipfsFile: metadata,
			chain,
			supply,
			collectionId: collectionId || null,
			unblockableContent,
			// royalities: [
			// 	{
			// 		address: user.address,
			// 		value: 10,
			// 	},
			// ],
			url,
			explicitContent,
			serialId,
			fee: thisFeeAmount,
			properties: properties ? formatedProperties : null,
			mainFile: mainFileNew,
			thumbnail: thumbnailNew, // href ? "https://ipfs.io/ipfs/" + href.substring(7, href.length) : null,
			contractAddress: config.get("contracts.BSC"),
			isLazyMint: isLazyMint,
			// chain === "ETHEREUM" ? config.get("contracts.ethErc721") : config.get("contracts.polygonErc721"),
		});

		// nftProperties = {
		//     name,
		//     description,
		//     external_url: url,
		//     mimetype: files.nftFile[0].mimetype,
		//     image: thumbnailFile,
		//     tokenId: serialId,
		//     attributes: metadataAttr,
		//     ...mainNftFileProperties,
		// };
		//
		// metadata = await ipfsClient.store(nftProperties);
		//
		// result.ipfsFile = metadata
		//
		// await result.save();

		if (!result) return reject(new HumanError(Errors.USER_TOKEN_FAILED.MESSAGE, Errors.USER_TOKEN_FAILED.CODE));

		await UserAssignedToken.create({
			userId: user.id,
			tokenId: result.id,
			collectionId: collectionId || null,
			status: isLazyMint ? "NOT_MINTED" : "PENDING",
		});

		resolve({
			data: { result, fee: thisFeeAmount },
		});
	});
}

/**
 * update user status token
 * @param {*} userId
 * @param {*} tokenId
 * @param {*} txId
 * @returns
 */
function updateToken(userId, tokenId, txId) {
	return new Promise(async (resolve, reject) => {
		let result = await UserAssignedToken.findOneAndUpdate({ tokenId, userId }, { status: "BURN" });

		if (!result)
			return reject(
				new NotFoundError(
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.MESSAGE,
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.CODE,
					{ id: tokenId },
				),
			);

		let token = await UserToken.findOneAndUpdate({ _id: tokenId }, { deletedAt: new Date() });

		if (!token)
			return reject(
				new NotFoundError(Errors.USER_TOKEN_NOT_FOUND.MESSAGE, Errors.USER_TOKEN_NOT_FOUND.CODE, {
					id: tokenId,
				}),
			);

		return resolve("Successful");
	});
}

function getToken(id, user) {
	return new Promise(async (resolve, reject) => {
		const result = await UserToken.findOne({ _id: id, deletedAt: null })
			.populate({
				path: "collectionId",
				match: { deletedAt: null },
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_TOKEN_NOT_FOUND.MESSAGE, Errors.USER_TOKEN_NOT_FOUND.CODE, { id }),
			);

		let is_liked = false;

		if (user) {
			let like = await UserFollowLike.findOne({ userId: user._id, likedToken: new ObjectId(id) });
			if (like) is_liked = true;
		}
		result["is_liked"] = is_liked;

		const currentAssignedToken = await UserAssignedToken.findOne({
			status: { $in: ["FREE", "IN_AUCTION", "PENDING", "NOT_MINTED"] },
			deletedAt: null,
			tokenId: id,
		})
			.sort({ createdAt: "desc" })
			.populate("userId")
			.lean();

		let activeAuction;

		if (!currentAssignedToken) {
			return reject(
				new NotFoundError(Errors.USER_TOKEN_NOT_FOUND.MESSAGE, Errors.USER_TOKEN_NOT_FOUND.CODE, {
					id,
				}),
			);
		}

		if (String(currentAssignedToken.userId._id) != String(user?.id) && currentAssignedToken.status == "PENDING") {
			return reject(
				new NotFoundError(Errors.USER_TOKEN_NOT_FOUND.MESSAGE, Errors.USER_TOKEN_NOT_FOUND.CODE, {
					id,
				}),
			);
		}

		const currentDate = new Date();
		activeAuction = await UserAuctions.findOne({
			assignTokenId: currentAssignedToken._id,
			status: "ACTIVE",
			// start: {$lt: currentDate},
			end: { $gt: currentDate },
		})
			.lean()
			.select(
				"_id userId assignTokenId start end status basePrice immediatePrice bookingPrice reserveAddress signature createdAt updatedAt deletedAt __v",
			);

		const offerQuery = {
			deletedAt: null,
			expiresAt: { $gt: new Date() },
			status: "REGISTER",
			$or: [{ assignedTokenId: currentAssignedToken._id }],
		};
		if (activeAuction) {
			offerQuery.$or.push({ auctionId: activeAuction._id });
		}
		const thisTempOffers = await UserAuctionOffer.find(offerQuery)
			.populate("userId", "image username email _id address")
			.sort("-amount")
			.lean();

		const offers = [];
		const bids = [];
		let highestOffer = null;

		if (thisTempOffers.length > 0) {
			highestOffer = {
				price: thisTempOffers[0].amount,
				name: thisTempOffers[0].userId.username,
				email: thisTempOffers[0].userId.email,
				image: thisTempOffers[0].userId.image,
				_id: thisTempOffers[0].userId._id,
			};
			for (let i = 0; i < thisTempOffers.length; i++) {
				if (thisTempOffers[i].auctionId) {
					bids.push(thisTempOffers[i]);
				}
				if (thisTempOffers[i].assignedTokenId) {
					offers.push(thisTempOffers[i]);
				}
			}
		}

		const similiars = await UserAssignedToken.find({
			collectionId: currentAssignedToken.collectionId,
			status: { $in: ["FREE", "IN_AUCTION"] },
			_id: { $ne: currentAssignedToken._id },
		})
			.limit(10)
			.populate("userId", "_id image email username address")
			.populate("tokenId")
			.populate("collectionId", "name description image")
			.lean();

		for (let i = 0; i < similiars.length; i++) {
			is_liked = false;
			if (user) {
				let like = await UserFollowLike.findOne({
					userId: user._id,
					likedToken: new ObjectId(similiars[i].tokenId._id),
				});
				if (like) is_liked = true;
			}
			similiars[i].is_liked = is_liked;
		}

		const tokenIds = similiars.map((sm) => String(sm.tokenId._id));
		const filtered = similiars.filter(({ tokenId }, index) => !tokenIds.includes(String(tokenId._id), index + 1));

		// const similiars = await UserToken.find({ collectionId: result.collectionId, _id: { $ne: id } }).lean();
		return resolve({
			token: { ...result },
			auction: activeAuction,
			assignedToken: currentAssignedToken,
			offers,
			bids,
			highestOffer,
			similiars: filtered.map(({ tokenId, ...rest }) => {
				return { ...tokenId, assignedToken: rest };
			}),
		});
	});
}

function getTokens(data) {
	return new Promise(async (resolve, reject) => {
		const {
			page,
			limit,
			order,
			sort,
			isSlider,
			isTrend,
			name,
			user,
			collection,
			status,
			chain,
			createdAt,
			searchQuery,
		} = data;

		const query = {};

		// Token
		if (isSlider) query["tokenId.isSlider"] = { $in: isSlider.map((flag) => (flag === "true" ? true : false)) };
		if (isTrend) query["tokenId.isTrend"] = { $in: isTrend.map((flag) => (flag === "true" ? true : false)) };

		if (name) {
			query["tokenId.name"] = {
				$regex: name || "",
				$options: "i",
			};
		}

		if (chain) query["tokenId.chain"] = { $in: chain };

		// User
		if (user) {
			query["$or"] = [
				{
					"userId.username": {
						$regex: user || "",
						$options: "i",
					},
				},
				{
					"userId.address": {
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

		// Assigned Token
		if (status) query["status"] = { $in: status };

		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		if (searchQuery) {
			query["$or"] = [
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
				{
					"collectionId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					name: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		let sortObject = { [sort]: order === "DESC" ? -1 : 1 };
		if (sort === "user") {
			sortObject = { ["userId.username"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "collection") {
			sortObject = { ["collectionId.name"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "isSlider") {
			sortObject = { ["tokenId.isSlider"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "isTrend") {
			sortObject = { ["tokenId.isTrend"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "name") {
			sortObject = { ["tokenId.name"]: order === "DESC" ? -1 : 1 };
		}

		if (sort === "chain") {
			sortObject = { ["tokenId.chain"]: order === "DESC" ? -1 : 1 };
		}

		const result = await UserAssignedToken.aggregate([
			{
				$lookup: {
					from: "userTokens",
					localField: "tokenId",
					foreignField: "_id",
					as: "tokenId",
				},
			},
			{ $unwind: "$tokenId" },
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
					from: "userCollections",
					localField: "collectionId",
					foreignField: "_id",
					as: "collectionId",
				},
			},
			{ $unwind: "$collectionId" },
			{ $match: { $and: [query, { deletedAt: null }] } },
			{ $sort: sortObject },
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
	});
}

function tokenSelector(page, limit, order, searchQuery) {
	return new Promise(async (resolve, reject) => {
		const query = {
			deletedAt: null,
		};
		if (searchQuery) {
			query["$or"] = [
				{
					name: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					description: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const count = await UserToken.countDocuments(query);
		const result = await UserToken.find(query)
			.populate({
				path: "collectionId",
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.select("-__v")
			.sort({ createdAt: order })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(); // == raw: true

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: result,
		});
	});
}

function getTokenByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await UserToken.findOne({ _id: id })
			.populate({
				path: "collectionId",
				match: { deletedAt: null },
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.populate("userId")
			.lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_TOKEN_NOT_FOUND.MESSAGE, Errors.USER_TOKEN_NOT_FOUND.CODE, {
					id,
				}),
			);

		return resolve(result);
	});
}

function getTokensByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, collection, chain, createdAt, explicitContent } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {};
		if (chain) query.chain = chain;
		if (createdAt) {
			query.createdAt = { $gte: createdAt };
		}
		if (collection) query.collection = collection;
		if (explicitContent) query.explicitContent = explicitContent;

		const count = await UserToken.countDocuments(query);
		const items = await UserToken.find(query)
			.populate({
				path: "collectionId",
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.populate("userId")
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(); // == raw: true

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: items,
		});
	});
}

function tokenSelectorByManager(page, limit, order, searchQuery) {
	return new Promise(async (resolve, reject) => {
		const query = {};
		if (searchQuery) {
			query["$or"] = [
				{
					name: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					description: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}
		const count = await UserToken.countDocuments(query);
		const result = await UserToken.find(query)
			.populate({
				path: "collectionId",
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.populate("userId")
			.select("-__v")
			.sort({ createdAt: order })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(); // == raw: true

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: result,
		});
	});
}

function getUserPendingTokens(data, user) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
			userId: user.id,
			status: "PENDING",
		};

		const count = await UserAssignedToken.countDocuments(query);
		const items = await UserAssignedToken.find(query)
			.populate({
				path: "collectionId",
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.populate("tokenId")
			.populate("userId")
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(); // == raw: true

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: items,
		});
	});
}

function getTokenUnblockableContent(id, user) {
	return new Promise(async (resolve, reject) => {
		const result = await UserAssignedToken.findOne({
			tokenId: id,
			userId: user.id,
			status: { $in: ["FREE", "IN_AUCTION", "NOT_MINTED"] },
		})
			.select("tokenId")
			.populate("tokenId", "unblockableContent");

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_TOKEN_NOT_FOUND.MESSAGE, Errors.USER_TOKEN_NOT_FOUND.CODE, {
					id,
				}),
			);

		resolve(result.tokenId?.unblockableContent);
	});
}

function editUserTokenByManager(id, isTrend, isSlider) {
	return new Promise(async (resolve, reject) => {
		const thisToken = await UserToken.findOne({ _id: new ObjectId(id), deletedAt: null });

		if (!thisToken) {
			return reject(new NotFoundError(Errors.USER_TOKEN_NOT_FOUND.MESSAGE, Errors.USER_TOKEN_NOT_FOUND.CODE));
		}

		thisToken.isSlider = isSlider;
		thisToken.isTrend = isTrend;

		await thisToken.save();
		return resolve("Successful");
	});
}

function getTokensCount(user) {
	return new Promise(async (resolve, reject) => {
		const count = UserAssignedToken.countDocuments({
			userId: user.id,
			deletedAt: null,
			status: { $in: ["FREE", "IN_AUCTION", "NOT_MINTED"] },
		});

		return resolve(count);
	});
}

/**
 *import existing token from user
 * @param {*} user
 * @param {Object} data
 * @returns
 */
function importToken(user, { chain, address }) {
	return new Promise(async (resolve, reject) => {
		try {
			// create chain config
			let chainConfig = {
				ETHEREUM: {
					baseUrl: config.get("apiKey.ethereum.url"),
					apiKey: config.get("apiKey.ethereum.key"),
					provider: config.get("providers.ethereum"),
				},
				POLYGON: {
					baseUrl: config.get("apiKey.polygon.url"),
					apiKey: config.get("apiKey.polygon.key"),
					provider: config.get("providers.polygon"),
				},
			}?.[chain];

			// get list of erc721 token for user
			let {
				data: { result },
			} = await axios.get(
				`${chainConfig.baseUrl}/api?module=account&action=tokennfttx&contractaddress=${address}&address=${user?.address}&page=1&offset=10000&sort=asc&apikey=${chainConfig.apiKey}`,
			);

			let web3 = new Web3(chainConfig.provider);

			let contract = new web3.eth.Contract(
				[
					{
						inputs: [
							{
								internalType: "uint256",
								name: "tokenId",
								type: "uint256",
							},
						],
						name: "ownerOf",
						outputs: [
							{
								internalType: "address",
								name: "",
								type: "address",
							},
						],
						stateMutability: "view",
						type: "function",
					},
					{
						inputs: [
							{
								internalType: "uint256",
								name: "tokenId",
								type: "uint256",
							},
						],
						name: "tokenURI",
						outputs: [
							{
								internalType: "string",
								name: "",
								type: "string",
							},
						],
						stateMutability: "view",
						type: "function",
					},
				],
				address,
			);

			// process nft result
			for (const item of result ?? []) {
				try {
					// Check if the recipient's address is equal to the user's address
					if (item?.to !== user?.address) continue;

					// Check token ownership
					let owner = (await contract.methods.ownerOf(item.tokenID).call()).toLowerCase();

					if (owner !== user?.address) continue;

					// Check the token already exists
					let token = await UserToken.findOne({ serialId: item.tokenID, contractAddress: address });

					if (token) continue;

					// get token url from contract by token id
					let tokenUrl = await contract.methods.tokenURI(item.tokenID).call();

					let metadata;

					// get token metadata from ipfs and url
					if (tokenUrl.includes("ipfs://"))
						metadata = await axios.get(tokenUrl.replace("ipfs://", "https://ipfs.io/ipfs/"));
					else metadata = await axios.get(tokenUrl);

					// get image buffer
					const imageBuffer = await axios({
						method: "GET",
						url: metadata.data.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
						responseType: "arraybuffer",
					});

					// upload token to s3
					let image = await UploadS3(imageBuffer.data);

					// check and create collection
					let collection = await UserCollection.findOneAndUpdate(
						{ name: item?.tokenName },
						{ name: item?.tokenName, description: `${item?.tokenName} ( ${item?.tokenSymbol} )` },
						{ upsert: true, new: true },
					);

					// save token data in db
					token = await UserToken.create({
						serialId: item.tokenID,
						name: metadata?.data?.name,
						description: metadata?.data?.description,
						ipfsFile: { url: tokenUrl },
						collectionId: collection.id,
						mainFile: image,
						thumbnail: image,
						contractAddress: address,
						chain,
					});

					await UserExplore.create({
						name: token.name,
						type: "TOKENS",
						typeId: token.id,
						tokenImage: image?.location,
					});

					await UserExplore.findOneAndUpdate(
						{ type: "COLLECTIONS", typeId: collection.id },
						{ name: collection.name, type: "COLLECTIONS", typeId: collection.id },
						{ upsert: true },
					);

					// assigned token to user
					await UserAssignedToken.create({
						userId: user.id,
						tokenId: token.id,
						collectionId: collection.id,
						status: "FREE",
					});

					// save data in activity
					let activity = {};
					if (item.from === NULL_ADDRESS) activity = { to: user.id, type: "MINT" };
					else {
						let newUser = await User.findOneAndUpdate(
							{ address: item.to },
							{ address: item.to },
							{ upsert: true, new: true },
						);

						activity = { from: newUser.id, to: user.id, type: "TRANSFER" };
					}

					await UserActivity.create({
						...activity,
						tokenId: token.id,
						collectionId: collection.id,
						blockNumber: item.blockNumber,
						transactionHash: item.hash,
						blockHash: item.blockHash,
					});

					// add this contract address in db for watcher
					await ContractAddress.findOneAndUpdate(
						{ address, chain, type: "ERC721" },
						{ address, chain, type: "ERC721" },
						{ upsert: true },
					);

					// update collection stats
					Stats.updateCollectionStats(collection.id, null, null, 1, 1);
				} catch (error) {
					continue;
				}
			}

			return resolve("Successful");
		} catch (error) {
			return reject(new NotFoundError(Errors.ADD_FAILED.MESSAGE, Errors.ADD_FAILED.CODE));
		}
	});
}

/**
 * upload file to s3
 * @param {*} buffer
 * @returns
 */
function UploadS3(buffer) {
	return new Promise(async (resolve, reject) => {
		s3Uploader.s3Config
			.upload({
				Bucket: s3Uploader.awsConfigs.bucket,
				Key: "imported-nft/" + uuidV4(),
				ACL: "public-read",
				Body: buffer,
			})
			.send((err, result) => {
				if (err) return reject(err);

				let image = [
					{
						location: `https://ftvio.s3.eu-central-1.amazonaws.com/${result.key}`,
						key: result.key,
						name: result.key.replace("imported-nft/", ""),
					},
				];

				resolve(image);
			});
	});
}

function userDiamonds(user, data) {
	console.log('user  ' , user)
	return new Promise(async (resolve, reject) => {
		const diamonds = await UserDiamond.find({
			deletedAt: null,
			userId: user,
		})
			.populate({ path: "diamondId", match: { deletedAt: null }, populate: { path: "diamondTypeId" } })
			.lean();
		return resolve(diamonds);
	});
}

module.exports = {
	addToken,
	getToken,
	getTokens,
	tokenSelector,
	getTokenByManager,
	getTokensByManager,
	tokenSelectorByManager,
	updateToken,
	getUserPendingTokens,
	getTokenUnblockableContent,
	editUserTokenByManager,
	getTokensCount,
	importToken,
	userDiamonds,
};

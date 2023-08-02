const {NotFoundError, HumanError, ConflictError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {
    Category,
    UserToken,
    User,
    UserCollection,
    UserAuctions,
    UserAssignedToken,
    UserAuctionOffer,
    UserExplore,
    UserCollectionStats,
    Blog,
    UserFollowLike,
    DiamondType,
    Prize
} = require("../../databases/mongodb");
const {isJson} = require("../../utils");
const extractProperties = require("../../utils/extractProperties");
const ObjectId = require("mongoose").Types.ObjectId;
const {sliceWinners} = require("./competition.service");

const socketService = require("./socket.service");

function generalSearch(page, limit, order, sort, searchQuery) {
    return new Promise(async (resolve, reject) => {
        const sortObj = {};
        sortObj[sort || "createdAt"] = order;
        const query = {
            deletedAt: null,
            $or: [
                {
                    name: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    address: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
            ],
        };

        const users = await UserExplore.find({type: "USERS", ...query})
            .select("-__v")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const tokens = await UserExplore.find({type: "TOKENS", ...query})
            .select("-__v")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const collections = await UserExplore.find({type: "COLLECTIONS", ...query})
            .select("-__v")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // const mapped = {
        // 	users: [],
        // 	tokens: [],
        // 	collections: [],
        // };

        // for (let i = 0; i < result.length; i++) {
        // 	if (result[i].type == "COLLECTIONS") {
        // 		result[i].itemsCount = await UserAssignedToken.countDocuments({
        // 			collectionId: result[i].typeId,
        // 			status: { $in: ["FREE", "IN_AUCTION"] },
        // 		});
        // 		mapped.collections.push(result[i]);
        // 	}
        // 	if (result[i].type == "TOKENS") {
        // 		mapped.tokens.push(result[i]);
        // 	}
        // 	if (result[i].type == "USERS") {
        // 		mapped.users.push(result[i]);
        // 	}
        // }

        for (let i = 0; i < collections.length; i++) {
            collections[i].nftsCount = await UserAssignedToken.countDocuments({
                status: {$in: ["FREE", "IN_AUCTION"]},
                deletedAt: null,
                collectionId: collections[i].typeId,
            });
        }

        resolve({users, tokens, collections});
        // const tokenQuery = {}
        // tokenQuery["$or"] = [
        // 	{
        // 		name: {
        // 			$regex: searchQuery || "",
        // 			$options: "i",
        // 		},
        // 	},
        // 	{
        // 		description: {
        // 			$regex: searchQuery || "",
        // 			$options: "i",
        // 		},
        // 	},
        // ];

        // const userQuery = {};
        // userQuery["$or"] = [
        // 	{
        // 		username: {
        // 			$regex: searchQuery || "",
        // 			$options: "i",
        // 		},
        // 	},
        // 	{
        // 		email: {
        // 			$regex: searchQuery || "",
        // 			$options: "i",
        // 		},
        // 	},
        // ];

        // const collectionQuery = {};
        // collectionQuery["$or"] = [
        // 	{
        // 		name: {
        // 			$regex: searchQuery || "",
        // 			$options: "i",
        // 		},
        // 	},
        // 	{
        // 		description: {
        // 			$regex: searchQuery || "",
        // 			$options: "i",
        // 		},
        // 	},
        // ];
        // const tokenCount = await UserToken.countDocuments(tokenQuery);
        // const tokenResult = await UserToken.find(tokenQuery)
        // 	.select("-__v")
        // 	.sort(sortObj)
        // 	.skip((page - 1) * limit)
        // 	.limit(limit)
        // 	.lean();

        // const userCount = await User.countDocuments(userQuery);
        // const userResult = await User.find(userQuery)
        // 	.select("-__v")
        // 	.sort(sortObj)
        // 	.skip((page - 1) * limit)
        // 	.limit(limit)
        // 	.lean();

        // const collectionCount = await UserCollection.countDocuments(collectionQuery);
        // const collectionResult = await UserCollection.find(collectionQuery)
        // 	.select("-__v")
        // 	.sort(sortObj)
        // 	.skip((page - 1) * limit)
        // 	.limit(limit)
        // 	.lean();

        // resolve({
        // 	user: {
        // 		total: userCount ?? 0,
        // 		pageSize: limit,
        // 		page,
        // 		data: userResult,
        // 	},
        // 	token: {
        // 		total: tokenCount ?? 0,
        // 		pageSize: limit,
        // 		page,
        // 		data: tokenResult,
        // 	},
        // 	collection: {
        // 		total: collectionCount ?? 0,
        // 		pageSize: limit,
        // 		page,
        // 		data: collectionResult,
        // 	},
        // });
    });
}

function searchUsername(username, userEntity) {
    return new Promise(async (resolve, reject) => {
        const user = await User.findOne({username});
        if (userEntity && user.id != userEntity.id) {
            return reject(
                new ConflictError(Errors.DUPLICATE_USER_USERNAME.MESSAGE, Errors.DUPLICATE_USER_USERNAME.CODE),
            );
        }
        if (!userEntity && user) {
            return reject(
                new ConflictError(Errors.DUPLICATE_USER_USERNAME.MESSAGE, Errors.DUPLICATE_USER_USERNAME.CODE),
            );
        }
        return resolve("Success");
    });
}

function explore(page, limit, order, sort, category, user, collection) {
    return new Promise(async (resolve, reject) => {
        sort = sort ? sort : "createdAt";
        const sortObj = {};
        sortObj[sort] = order;
        const query = {deletedAt: null, isExplorer: true};

        if (category) query.category = new ObjectId(category);
        if (user) query.user = new ObjectId(user);
        if (collection) query._id = collection;

        const count = await UserCollection.countDocuments(query);
        const result = await UserCollection.find(query)
            .populate("user", "_id username image")
            .populate("category", "_id title description icon")
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

function customExplorer(data, userId, ip) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, order, sort, user, collections, status, properties, chain, min, max, search} = data;
        let sortObj = {
            createdAt: order === "DESC" ? -1 : 1,
        };
        const currentDateAuction = new Date();
        let query = {
            deletedAt: null,
            // "assignedTokens.deletedAt": null,
            status: {$in: ["FREE", "IN_AUCTION"]},
            userId: new ObjectId(user),
            $or: [],
            $and: [],
        };

        if (min && !max) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$or.push({"auctions.basePrice": {$gte: min}}, {"auctions.immediatePrice": {$gte: min}});
        }

        if (max && !min) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$or.push({"auctions.basePrice": {$lte: max}}, {"auctions.immediatePrice": {$lte: max}});
        }

        if (min && max) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$and.push(
                {
                    $or: [{"auctions.basePrice": {$gte: min}}, {"auctions.immediatePrice": {$gte: min}}],
                },

                {
                    $or: [{"auctions.basePrice": {$lte: max}}, {"auctions.immediatePrice": {$lte: max}}],
                },
            );
        }

        if (sort == "mostFavorited") {
            sortObj = {"tokens.favoriteCount": -1};
        }

        if (sort == "recentlyListed") {
            query["status"] = "IN_AUCTION";
        }

        if (sort == "recentlySold") {
            query.status = "IN_AUCTION";
            sortObj = {updatedAt: -1};
        }
        if (sort == "recentlySold") {
            sortObj = {updatedAt: -1};
            query.status = "SOLD";
        }

        if (sort == "recentlyReceived") {
            query.status = "TRANSFERRED";
            sortObj = {updatedAt: -1};
        }

        if (sort == "endingSoon") {
            const currentDate = new Date();
            query.status = "IN_AUCTION";
            query["auctions.status"] = "ACTIVE";
            query["auctions.end"] = {$gt: currentDate};
            sortObj = {["auctions.end"]: 1};
        }

        if (sort == "priceLowToHigh") {
            query["auctions.status"] = "ACTIVE";
            sortObj = {"auctions.basePrice": 1, "auctions.immediatePrice": 1};
        }

        if (sort == "priceHighToLow") {
            query["auctions.status"] = "ACTIVE";
            sortObj = {"auctions.basePrice": -1, "auctions.immediatePrice": -1};
        }

        if (sort == "highestLastSale") {
            query["status"] = "SOLD";
            sortObj = {"auctions.basePrice": -1, "auctions.immediatePrice": -1};
        }

        if (collections) {
            query.collectionId = {$in: collections};
        }

        if (search) {
            query.$and.push({
                $or: [
                    {
                        "tokens.name": {
                            $regex: search || "",
                            $options: "i",
                        },
                    },
                    {
                        "tokens.description": {
                            $regex: search || "",
                            $options: "i",
                        },
                    },
                ],
            });
        }

        if (status && sort != "endingSoon" && sort != "recentlySold" && sort != "highestLastSale") {
            query["status"] = {$in: status};
        }

        if (chain) {
            query["tokens.chain"] = {$in: chain};
        }

        if (properties) {
            if (typeof properties == "string" && !isJson(properties)) {
                return reject(new HumanError(Errors.INVALID_COLLECTION.MESSAGE, Errors.INVALID_COLLECTION.CODE));
            }
            const or = [];
            const filteredProperties = [];
            for (let i = 0; i < properties.length; i++) {
                const existIndex = filteredProperties.findIndex((fp) => fp.title == properties[i].title);

                if (existIndex > -1) {
                    const newPropertyValues = properties[i].values;
                    filteredProperties[existIndex].values =
                        filteredProperties[existIndex].values.concat(newPropertyValues);
                } else {
                    filteredProperties.push(properties[i]);
                }
            }

            for (let i = 0; i < filteredProperties.length; i++) {
                or.push({
                    [`tokens.properties.title`]: filteredProperties[i].title,
                    [`tokens.properties.values`]: {$in: filteredProperties[i].values},
                });
            }

            query.$and.push(...or);
        }

        if (query.$or.length === 0) delete query.$or;
        if (query.$and.length === 0) delete query.$and;

        const temp = await UserAssignedToken.aggregate([
            // {
            // 	$lookup: {
            // 		from: "userAssignedTokens",
            // 		localField: "_id",
            // 		foreignField: "tokenId",
            // 		as: "assignedTokens",
            // 	},
            // },
            {
                $lookup: {
                    from: "userTokens",
                    localField: "tokenId",
                    foreignField: "_id",
                    as: "tokens",
                },
            },
            {
                $lookup: {
                    from: "userAuctions",
                    let: {assignedTokenId: "$_id"},
                    pipeline: [
                        {
                            $match: {
                                start: {$lt: currentDateAuction},
                                end: {$gt: currentDateAuction},
                                $expr: {
                                    $and: [
                                        {$eq: ["$deletedAt", null]},
                                        {$eq: ["$status", "ACTIVE"]},
                                        {
                                            $eq: [
                                                "$assignTokenId",
                                                "$$assignedTokenId" /* ObjectId("62835ecfe8d84b315aebdf2f")*/,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "auctions",
                },
            },
            {
                $lookup: {
                    from: "userAuctionOffers",
                    let: {auctionId: "$auctions._id"},
                    pipeline: [
                        {
                            $match: {
                                expiresAt: {$gt: currentDateAuction},
                                assignedTokenId: {$exists: false},
                                $expr: {
                                    $and: [
                                        {$eq: ["$deletedAt", null]},
                                        {$eq: ["$status", "REGISTER"]},

                                        {$eq: ["$auctionId", "$$auctionId"]},
                                    ],
                                },
                            },
                        },
                    ],
                    as: "auctionOffers",
                },
            },
            {
                $match: query,
            },
            {$sort: sortObj},

            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}], // add projection here wish you re-shape the docs
                },
            },
        ]);

        const thisTokens = temp[0].data.map(({tokens, auctions, auctionOffers, ...rest}) => {
            return {
                ...tokens[0],
                auctions,
                auctionOffers,
                assignedTokens: [rest],
            };
        });
        const tempCollections = [];

        for (let i = 0; i < thisTokens.length; i++) {
            const thisTokensOffers = thisTokens[i].auctionOffers;

            const isCollectionExist = tempCollections.find(
                (thisCollection) => thisCollection === String(thisTokens[i].collectionId),
            );
            if (!isCollectionExist) tempCollections.push(String(thisTokens[i].collectionId));

            if (thisTokensOffers.length > 0) {
                const highestOfferTemp = thisTokensOffers.reduce((max, min) => (max.amount > min.amount ? max : min));
                const thisUser = await User.findOne({_id: highestOfferTemp.userId}, "_id email username image");
                thisTokens[i].highestOffer = {
                    amount: highestOfferTemp.amount,
                    user: thisUser,
                };
            } else {
                thisTokens[i].highestOffer = null;
            }

            let is_liked = false;
            if (userId) {
                let like = await UserFollowLike.findOne({
                    userId: userId,
                    likedToken: new ObjectId(thisTokens[i]._id),
                });
                if (like) is_liked = true;
            }
            thisTokens[i].is_liked = is_liked;
        }

        const tempAssignedToken = await UserAssignedToken.find({
            deletedAt: null,
            userId: new ObjectId(user),
            status: {$in: ["FREE", "IN_AUCTION"]},
        })
            .select("tokenId")
            .populate("tokenId", "properties")
            .lean();

        const filteredProperties = tempAssignedToken.filter((as) => {
            return as.tokenId.properties?.length > 0;
        });

        const extractedProperties = extractProperties(filteredProperties.map((as) => as.tokenId));

        const metadata = temp[0].metadata[0];

        resolve({data: thisTokens, ...metadata, extractedProperties});
    });
}

function topSellers(page, limit, order, sort) {
    return new Promise(async (resolve, reject) => {
        // const temp = await UserAuctions.aggregate([
        // 	{
        // 		$match: {
        // 			status: "FINISH",
        // 		},
        // 	},
        // 	{
        // 		$group: {
        // 			_id: "$userId",
        // 			auctionId: { $first: "$_id" },
        // 			total: { $sum: 1 },
        // 		},
        // 	},
        // 	{
        // 		$lookup: {
        // 			from: "UserAuctionsOffer",
        // 			localField: "auctionId",
        // 			foreignField: "auctionId",
        // 			as: "offers",
        // 		},
        // 	},
        // 	{ $sort: { [sort]: order == "DESC" ? -1 : 1 } },
        // 	{
        // 		$facet: {
        // 			metadata: [{ $count: "total" }, { $addFields: { page } }],
        // 			data: [{ $skip: (page - 1) * limit }, { $limit: limit }], // add projection here wish you re-shape the docs
        // 		},
        // 	},
        // ]);

        // let thisSum = 0;
        // let totalSell = 0;
        // for (let i = 0; i < temp[0].data.length; i++) {
        // 	thisSum += temp[0].data[i].offers.reduce((n, { status, amount }) => {
        // 		if (status == "ACCEPTED") {
        // 			totalSell++;
        // 			return n + amount;
        // 		} else return n;
        // 	}, 0);

        // 	temp[0].data[i].amount = thisSum;
        // 	temp[0].data[i].totalSell = totalSell;
        // 	thisSum = 0;
        // 	totalSell = 0;
        // }

        // const metadata = temp[0].metadata[0];
        // const thisAuctions = temp[0].data.map(({ _id: user, ...other }) => ({
        // 	user,
        // 	...other,
        // }));

        // await User.populate(thisAuctions, { path: "user", select: "_id username image email" });

        // thisAuctions.sort((a, b) => b.amount - a.amount);

        // resolve({
        // 	data: thisAuctions.map((auc) => {
        // 		return { user: auc.user, totalSell: auc.totalSell, amount: auc.amount };
        // 	}),
        // 	...metadata,
        // });

        const topSellers = await UserCollectionStats.find({deletedAt: null, type: "ALL", volume: {$gte: 0}})
            .sort({volume: -1})
            .limit(10)
            .populate({
                path: "collectionId",
                populate: {
                    path: "user",
                    select: "image email address _id username",
                },
            })
            .lean();

        const thisSellers = [];
        for (let i = 0; i < topSellers.length; i++) {
            const existIndex = thisSellers.findIndex(
                (ts) => String(ts?._id) == String(topSellers[i]?.collectionId?.user?._id),
            );
            if (existIndex > -1) {
                thisSellers[existIndex].volume += topSellers[i].volume;
            } else {
                thisSellers.push({
                    ...topSellers[i].collectionId.user,
                    volume: topSellers[i].volume,
                });
            }
        }

        resolve({
            data: thisSellers,
        });
    });
}

function popularCollections(data) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, order, sort} = data;

        const temp = await UserAssignedToken.aggregate([
            {
                $match: {deletedAt: null, collectionId: {$not: {$eq: null}}, status: "SOLD"},
            },
            {
                $group: {
                    _id: "$collectionId",
                    count: {$sum: 1},
                },
            },

            {$sort: {[sort]: order == "DESC" ? -1 : 1}},
            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}], // add projection here wish you re-shape the docs
                },
            },
        ]);

        const metadata = temp[0].metadata[0];

        const thisCollections = temp[0].data.map(({_id: collection, ...other}) => ({
            collection,
            ...other,
        }));

        await UserCollection.populate(thisCollections, {
            path: "collection",
            select: "_id name description image category background user",
            populate: {
                path: "user",
                select: "username image",
            },
        });

        resolve({data: thisCollections, ...metadata});
    });
}

function assets(data, userId, ip) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, sort, order, search, min, max, collections, categories, status, chain} = data;
        let sortObj = {
            createdAt: order === "DESC" ? -1 : 1,
        };

        const currentDateAuction = new Date();
        const query = {
            // "auctions.basePrice": { $gte: min ? min : 0, $lte: max ? max : Infinity },
            // "assignedTokens.status": { $or: [ {$eq: "IN_AUCTION"} , {$eq: "FREE"} ]},
            // $or: [{"assignedTokens.status": "IN_AUCTION"} , {"assignedTokens.status": "FREE"}]},
            $or: [{"assignedTokens.status": "IN_AUCTION"}, {"assignedTokens.status": "FREE"}],
            $and: [],
        };
        //	{ "assignedTokens.status": "IN_AUCTION" }, { "assignedTokens.status": "FREE" }

        if (min && !max) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$or.push({"auctions.basePrice": {$gte: min}}, {"auctions.immediatePrice": {$gte: min}});
        }

        if (max && !min) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$or.push({"auctions.basePrice": {$lte: max}}, {"auctions.immediatePrice": {$lte: max}});
        }

        if (min && max) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$and.push(
                {
                    $or: [{"auctions.basePrice": {$gte: min}}, {"auctions.immediatePrice": {$gte: min}}],
                },
                {
                    $or: [{"auctions.basePrice": {$lte: max}}, {"auctions.immediatePrice": {$lte: max}}],
                },
            );
        }

        const options = [
            "recentlyListed", // recently listed
            "recentlySold",
            "recentlyReceived",
            "endingSoon",
            "priceLowToHigh",
            "priceHighToLow",
            "highestLastSale",
        ];

        if (sort == "mostFavorited") {
            sortObj = {favoriteCount: -1};
        }

        if (sort == "recentlyListed") {
            query["assignedTokens.status"] = "IN_AUCTION";
            sortObj = {"assignedTokens.updatedAt": -1};
        }

        if (sort == "recentlySold") {
            query["assignedTokens.status"] = "SOLD";
            sortObj = {"assignedTokens.updatedAt": -1};
        }

        if (sort == "recentlyReceived") {
            query["assignedTokens.status"] = "TRANSFERRED";
            sortObj = {"assignedTokens.updatedAt": -1};
        }

        if (sort == "endingSoon") {
            const currentDate = new Date();
            query.status = "IN_AUCTION";
            query["auctions.status"] = "ACTIVE";
            query["auctions.end"] = {$gt: currentDate};
            sortObj = {["auctions.end"]: 1};
        }

        if (sort == "priceLowToHigh") {
            query["auctions.status"] = "ACTIVE";
            sortObj = {"auctions.basePrice": 1, "auctions.immediatePrice": 1};
        }

        if (sort == "priceHighToLow") {
            query["auctions.status"] = "ACTIVE";
            sortObj = {"auctions.basePrice": -1, "auctions.immediatePrice": -1};
        }

        if (sort == "highestLastSale") {
            query["assignedTokens.status"] = "SOLD";
            sortObj = {"auctions.basePrice": -1, "auctions.immediatePrice": -1};
        }

        if (search) {
            query.$and.push({
                $or: [
                    {
                        name: {
                            $regex: search || "",
                            $options: "i",
                        },
                    },
                    {
                        description: {
                            $regex: search || "",
                            $options: "i",
                        },
                    },
                ],
            });
        }

        if (status && sort != "endingSoon" && sort != "recentlySold" && sort != "highestLastSale") {
            if (typeof status === "string" && !isJson(status)) {
                return reject(
                    new HumanError(
                        Errors.INVALID_ASSIGNED_TOKEN_STATUS.MESSAGE,
                        Errors.INVALID_ASSIGNED_TOKEN_STATUS.CODE,
                    ),
                );
            }
            query["assignedTokens.status"] = {$in: status};
        }

        if (chain) {
            if (typeof chain === "string" && !isJson(chain)) {
                return reject(new HumanError(Errors.INVALID_CHAIN.MESSAGE, Errors.INVALID_CHAIN.CODE));
            }

            query.chain = {$in: chain};
        }

        if (collections) {
            if (typeof collections === "string" && !isJson(collections)) {
                return reject(new HumanError(Errors.INVALID_COLLECTION.MESSAGE, Errors.INVALID_COLLECTION.CODE));
            }
            query.collectionId = {$in: collections.map((id) => new ObjectId(id))};
        }

        if (categories) {
            if (typeof categories === "string" && !isJson(categories)) {
                return reject(new HumanError(Errors.INVALID_CATEGORIES.MESSAGE, Errors.INVALID_CATEGORIES.CODE));
            }
            query["collection.category"] = {$in: categories.map((id) => new ObjectId(id))};
        }

        if (query.$or.length === 0) delete query.$or;
        if (query.$and.length === 0) delete query.$and;

        const thisItems = await UserToken.aggregate([
            {
                $lookup: {
                    from: "userAssignedTokens",
                    let: {tokenId: "$_id"},
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {$eq: ["$deletedAt", null]},
                                        //{ $or: [{ $eq: ["$status", "FREE"] }, { $eq: ["$status", "IN_AUCTION"] }] },
                                        {$eq: ["$tokenId", "$$tokenId"]},
                                    ],
                                },
                            },
                        },
                    ],
                    as: "assignedTokens",
                },
            },
            {$unwind: "$assignedTokens"},
            {
                $lookup: {
                    from: "userAuctions",
                    let: {assignedTokenId: "$assignedTokens._id"},
                    pipeline: [
                        {
                            $match: {
                                start: {$lt: currentDateAuction},
                                end: {$gt: currentDateAuction},
                                $expr: {
                                    $and: [
                                        {$eq: ["$deletedAt", null]},
                                        {$eq: ["$status", "ACTIVE"]},
                                        {
                                            $eq: [
                                                "$assignTokenId",
                                                "$$assignedTokenId" /* ObjectId("62835ecfe8d84b315aebdf2f")*/,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "auctions",
                },
            },
            {$unwind: {path: "$auctions", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "userAuctionOffers",
                    let: {auctionId: "$auctions._id"},
                    pipeline: [
                        {
                            $match: {
                                expiresAt: {$gt: currentDateAuction},
                                assignedTokenId: {$exists: false},
                                $expr: {
                                    $and: [
                                        {$eq: ["$deletedAt", null]},
                                        {$eq: ["$status", "REGISTER"]},

                                        {$eq: ["$auctionId", "$$auctionId"]},
                                    ],
                                },
                            },
                        },
                    ],
                    as: "auctionOffers",
                },
            },
            {
                $lookup: {
                    from: "userCollections",
                    localField: "collectionId",
                    foreignField: "_id",
                    as: "collection",
                },
            },
            {
                $match: query,
            },
            {$sort: sortObj},
            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}], // add projection here wish you re-shape the docs
                },
            },
        ]);

        const items = thisItems[0].data.map(({assignedTokens, auctions, ...rest}) => {
            return {
                assignedTokens: assignedTokens ? [assignedTokens] : [],
                auctions: auctions ? [auctions] : [],
                ...rest,
            };
        });
        for (let i = 0; i < items.length; i++) {
            let is_liked = false;

            if (userId) {
                let like = await UserFollowLike.findOne({userId: userId, likedToken: new ObjectId(items[i]._id)});
                if (like) is_liked = true;
            }
            items[i].is_liked = is_liked;
        }

        await User.populate(items, [
            {
                path: "assignedTokens.userId",
                select: "username email image",
            },
            {
                path: "auctions.userId",
                select: "username email image",
            },
        ]);

        await UserCollection.populate(items, {
            path: "assignedTokens.collectionId",
            select: "-__v",
            populate: {
                path: "category",
                match: {deletedAt: null},
            },
        });
        const metadata = thisItems[0].metadata[0];
        resolve({data: items, ...metadata});
    });
}

function featuredUsers(data) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, sort, order} = data;
        const sortObj = {};
        sortObj[sort || "createdAt"] = order;

        const thisUsers = await User.find({isFeatured: true, deletedAt: null})
            .select("-__v")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        resolve({data: thisUsers});
    });
}

function featuredCollections(data) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, sort, order} = data;
        const sortObj = {};
        sortObj[sort || "createdAt"] = order;

        const thisCollections = await UserCollection.find({isFeatured: true, deletedAt: null})
            .populate("user", "username _id address image")
            .select("-__v")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        resolve({data: thisCollections});
    });
}

function trendingArts(data) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, order, sort} = data;

        const sortObj = {
            createdAt: order === "DESC" ? -1 : 1,
        };

        // const temp = await UserAuctionOffer.aggregate([
        // 	{
        // 		$match: {
        // 			/*status: "REGISTER"*/
        // 		},
        // 	},
        // 	{
        // 		$group: {
        // 			_id: "$auctionId",
        // 			count: { $sum: 1 },
        // 		},
        // 	},

        // 	{ $sort: { [sort]: order == "DESC" ? -1 : 1 } },

        // 	{
        // 		$facet: {
        // 			metadata: [{ $count: "total" }, { $addFields: { page } }],
        // 			data: [{ $skip: (page - 1) * limit }, { $limit: limit }], // add projection here wish you re-shape the docs
        // 		},
        // 	},
        // ]);

        // const temp = await UserAuctionOffer.aggregate([
        // 	{
        // 		$match: {
        // 			status: { $in: ["REGISTER"] },
        // 			auctionId: { $ne: null },
        // 			assignedTokenId: null,
        // 			deletedAt: null,
        // 		},
        // 	},
        // 	{
        // 		$group: {
        // 			_id: "$auctionId",
        // 			count: { $sum: 1 },
        // 		},
        // 	},

        // 	{ $sort: { [sort]: order == "DESC" ? -1 : 1 } },

        // 	{
        // 		$facet: {
        // 			metadata: [{ $count: "total" }, { $addFields: { page } }],
        // 			data: [{ $skip: (page - 1) * limit }, { $limit: limit }], // add projection here wish you re-shape the docs
        // 		},
        // 	},
        // ]);

        // let thisAuctionsOffers = [];

        // if (temp[0].data.length > 0) {
        // 	thisAuctionsOffers = temp[0].data.map(({ _id: auction, ...other }) => ({
        // 		auction,
        // 		...other,
        // 	}));

        // 	await UserAuctions.populate(thisAuctionsOffers, {
        // 		path: "auction",
        // 		populate: {
        // 			path: "assignTokenId",
        // 			populate: [
        // 				{
        // 					path: "collectionId",
        // 					populate: {
        // 						path: "category",
        // 						match: { deletedAt: null },
        // 					},
        // 				},
        // 				{ path: "userId" },
        // 				{ path: "tokenId" },
        // 			],
        // 		},
        // 	});

        // 	for (let i = 0; i < thisAuctionsOffers.length; i++) {
        // 		let thisTokenFreeAssignedToken;
        // 		if (thisAuctionsOffers[i].auction) {
        // 			thisTokenFreeAssignedToken = await UserAssignedToken.findOne({
        // 				tokenId: thisAuctionsOffers[i].auction.assignTokenId.tokenId._id,
        // 				status: { $in: ["FREE", "IN_AUCTION"] },
        // 				deletedAt: null,
        // 			})
        // 				.populate("userId", "username image email")
        // 				.lean();
        // 		}

        // 		// const thisAddresses = thisAuctionsOffers[i].auction.assignTokenId.tokenId.royalities.map(
        // 		// 	(roy) => roy.address,
        // 		// );
        // 		// const thisOwner = await User.findOne({
        // 		// 	address: { $in: thisAddresses },
        // 		// });
        // 		thisAuctionsOffers[i].owner = thisTokenFreeAssignedToken
        // 			? { ...thisTokenFreeAssignedToken.userId }
        // 			: null;
        // 	}

        // 	await User.populate(thisAuctionsOffers, {
        // 		path: "userId",
        // 		select: "username email image",
        // 	});
        // }

        // let thisTrends = [];
        // if (thisAuctionsOffers.length > 0) {
        // 	thisTrends = thisAuctionsOffers.map((trend) => {
        // 		return {
        // 			offerCount: trend.count,
        // 			owner: trend.owner,
        // 			token: trend.auction ? trend.auction.assignTokenId.tokenId : null,
        // 			collection: trend.auction ? trend.auction.assignTokenId.collectionId : null,
        // 			// assignedToken: {
        // 			// 	_id: trend.auction ? trend.auction.assignTokenId._id : null,
        // 			// 	user: trend.auction ? trend.auction.assignTokenId.userId : null,
        // 			// 	status: trend.auction ? trend.auction.assignTokenId.status : null,
        // 			// },
        // 		};
        // 	});
        // }

        // const metadata = temp[0].metadata[0];

        const thisTokens = await UserToken.find({isTrend: true, deletedAt: null})
            .select("_id name description thumbnail favoriteCount")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const thisAssignedTokens = await UserAssignedToken.find({
            status: {$in: ["FREE", "IN_AUCTION"]},
            tokenId: {$in: thisTokens.map((token) => token._id)},
        })
            .populate("userId", "_id address username email image")
            .lean();

        const thisTrends = [];
        thisTokens.forEach((token, i) => {
            const assignedToken = thisAssignedTokens.find((ts) => String(ts.tokenId) === String(token._id));
            if (assignedToken) thisTrends.push({...thisTokens[i], owner: assignedToken.userId});
        });

        resolve({data: thisTrends});
    });
}

function collectionSearch(data, user) {
    return new Promise(async (resolve, reject) => {
        const {id, page, limit, sort, order, search, min, max, status, properties, chain} = data;
        let sortObj = {
            createdAt: order === "DESC" ? -1 : 1,
        };

        const currentDateAuction = new Date();
        const query = {
            collectionId: new ObjectId(id),
            deletedAt: null,
            status: {$in: ["FREE", "IN_AUCTION", "NOT_MINTED"]},
            $or: [],
            $and: [],
        };

        if (min && !max) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$or.push({"auctions.basePrice": {$gte: min}}, {"auctions.immediatePrice": {$gte: min}});
        }

        if (max && !min) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$or.push({"auctions.basePrice": {$lte: max}}, {"auctions.immediatePrice": {$lte: max}});
        }

        if (min && max) {
            query["auctions.status"] = {$in: ["ACTIVE"]};
            query.$and.push(
                {
                    $or: [{"auctions.basePrice": {$gte: min}}, {"auctions.immediatePrice": {$gte: min}}],
                },
                {
                    $or: [{"auctions.basePrice": {$lte: max}}, {"auctions.immediatePrice": {$lte: max}}],
                },
            );
        }

        if (sort == "mostFavorited") {
            sortObj = {"tokens.favoriteCount": -1};
        }

        if (sort == "recentlyListed") {
            query.status = "IN_AUCTION";
            sortObj = {updatedAt: -1};
        }

        if (sort == "recentlySold") {
            query.status = "SOLD";
            sortObj = {updatedAt: -1};
        }

        if (sort == "recentlyReceived") {
            query.status = "TRANSFERRED";
            sortObj = {updatedAt: -1};
        }

        if (sort == "endingSoon") {
            const currentDate = new Date();
            query.status = "IN_AUCTION";
            query["auctions.status"] = "ACTIVE";
            query["auctions.end"] = {$gt: currentDate};
            sortObj = {["auctions.end"]: 1};
        }

        if (sort == "priceLowToHigh") {
            query["auctions.status"] = "ACTIVE";
            sortObj = {"auctions.basePrice": 1, "auctions.immediatePrice": 1};
        }

        if (sort == "priceHighToLow") {
            query["auctions.status"] = "ACTIVE";
            sortObj = {"auctions.basePrice": -1, "auctions.immediatePrice": -1};
        }

        if (sort == "highestLastSale") {
            query["status"] = "SOLD";
            sortObj = {"auctions.basePrice": -1, "auctions.immediatePrice": -1};
        }

        if (search) {
            query.$and.push({
                $or: [
                    {
                        "tokens.name": {
                            $regex: search || "",
                            $options: "i",
                        },
                    },
                    {
                        "tokens.description": {
                            $regex: search || "",
                            $options: "i",
                        },
                    },
                ],
            });
        }

        if (status && sort != "endingSoon" && sort != "recentlySold" && sort != "highestLastSale") {
            query["status"] = {$in: status};
            if (status.includes("IN_AUCTION")) {
                query["auctions.status"] = "ACTIVE";
            }
        }

        if (chain) {
            query["tokens.chain"] = {$in: chain};
        }

        if (properties) {
            if (typeof properties == "string" && !isJson(properties)) {
                return reject(new HumanError(Errors.INVALID_COLLECTION.MESSAGE, Errors.INVALID_COLLECTION.CODE));
            }

            const or = [];
            const filteredProperties = [];
            for (let i = 0; i < properties.length; i++) {
                const existIndex = filteredProperties.findIndex((fp) => fp.title == properties[i].title);

                if (existIndex > -1) {
                    const newPropertyValues = properties[i].values;
                    filteredProperties[existIndex].values =
                        filteredProperties[existIndex].values.concat(newPropertyValues);
                } else {
                    filteredProperties.push(properties[i]);
                }
            }

            for (let i = 0; i < filteredProperties.length; i++) {
                or.push({
                    [`tokens.properties.title`]: filteredProperties[i].title,
                    [`tokens.properties.values`]: {$in: filteredProperties[i].values},
                });
            }

            query.$and.push(...or);
        }

        if (query.$or.length === 0) delete query.$or;
        if (query.$and.length === 0) delete query.$and;

        const thisItems = await UserAssignedToken.aggregate([
            {
                $lookup: {
                    from: "userTokens",
                    localField: "tokenId",
                    foreignField: "_id",
                    as: "tokens",
                },
            },
            {
                $lookup: {
                    from: "userAuctions",
                    let: {assignedTokenId: "$_id"},
                    pipeline: [
                        {
                            $match: {
                                start: {$lt: currentDateAuction},
                                end: {$gt: currentDateAuction},
                                $expr: {
                                    $and: [
                                        {$eq: ["$deletedAt", null]},
                                        {$eq: ["$status", "ACTIVE"]},
                                        {
                                            $eq: ["$assignTokenId", "$$assignedTokenId"],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "auctions",
                },
            },
            {$unwind: {path: "$auctions", preserveNullAndEmptyArrays: true}},
            {
                $match: query,
            },
            {$sort: sortObj},
            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}],
                },
            },
        ]);

        const thisTokens = thisItems[0].data.map(({tokens, auctions, ...rest}) => {
            return {
                ...tokens[0],
                auctions: auctions ? [auctions] : [],
                assignedTokens: [rest],
            };
        });

        await User.populate(thisTokens, [
            {
                path: "userId",
                select: "username email image",
            },
            {
                path: "auctions.userId",
                select: "username email image",
            },
        ]);

        let floorPrice = null; // it's in the ranking. should this be here?
        for (let i = 0; i < thisTokens.length; i++) {
            const thisAuction = thisTokens[i].auctions[0]?._id;
            thisTokens[i]["auctionOffers"] = [];
            if (thisAuction) {
                thisTokens[i]["auctionOffers"] = await UserAuctionOffer.find({
                    expiresAt: {$gt: currentDateAuction},
                    status: "REGISTER",
                    deletedAt: null,
                    auctionId: thisAuction,
                    assignedTokenId: null,
                })
                    .sort("amount")
                    .lean();
            }

            let is_liked = false;
            if (user) {
                let like = await UserFollowLike.findOne({
                    userId: user._id,
                    likedToken: new ObjectId(thisTokens[i]._id),
                });
                if (like) is_liked = true;
            }
            thisTokens[i].is_liked = is_liked;
        }

        const tempCol = await UserCollection.findById(id, "-deletedAt -__v -updatedAt")
            .populate("user", "username email _id address image")
            .lean();

        const metadata = thisItems[0].metadata[0];

        const collection = {
            ...tempCol,
            floorPrice,
            items: metadata?.total ?? 0,
        };

        const tempAssignedToken = await UserAssignedToken.find({
            deletedAt: null,
            collectionId: new ObjectId(id),
            status: {$in: ["FREE", "IN_AUCTION"]},
        })
            .select("tokenId")
            .populate("tokenId", "properties")
            .lean();

        const filteredProperties = tempAssignedToken.filter((as) => {
            return as.tokenId.properties?.length > 0;
        });
        const extractedProperties = extractProperties(filteredProperties.map((as) => as.tokenId));

        resolve({data: thisTokens, ...metadata, extractedProperties, collection});
    });
}

function slider(data) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, order, sort} = data;
        const sortObj = {
            createdAt: order === "DESC" ? -1 : 1,
        };
        // const temp = await UserAuctionOffer.aggregate([
        // 	{
        // 		$match: {
        // 			status: { $in: ["REGISTER"] },
        // 			auctionId: { $ne: null },
        // 			assignedTokenId: null,
        // 			deletedAt: null,
        // 		},
        // 	},
        // 	{
        // 		$group: {
        // 			_id: "$auctionId",
        // 			count: { $sum: 1 },
        // 		},
        // 	},

        // 	{ $sort: { [sort]: order == "DESC" ? -1 : 1 } },

        // 	{
        // 		$facet: {
        // 			metadata: [{ $count: "total" }, { $addFields: { page } }],
        // 			data: [{ $skip: (page - 1) * limit }, { $limit: limit }], // add projection here wish you re-shape the docs
        // 		},
        // 	},
        // ]);

        // const thisAuctionsOffers = temp[0].data.map(({ _id: auction, ...other }) => ({
        // 	auction,
        // 	...other,
        // }));

        // if (thisAuctionsOffers.length > 0) {
        // 	for (let i = 0; i < thisAuctionsOffers.length; i++) {
        // 		const tempHighestOffer = await UserAuctionOffer.find({
        // 			deletedAt: null,
        // 			status: "REGISTER",
        // 			auctionId: thisAuctionsOffers[i].auction,
        // 		})
        // 			.populate("userId", "image username amount")
        // 			.sort("-amount")
        // 			.lean();

        // 		if (tempHighestOffer.length > 0) {
        // 			thisAuctionsOffers[i].highestOffer = {
        // 				price: tempHighestOffer[0].amount ? tempHighestOffer[0].amount : null,
        // 				name: tempHighestOffer[0].userId.username ? tempHighestOffer[0].userId.username : null,
        // 				image: tempHighestOffer[0].userId.image ? tempHighestOffer[0].userId.image : null,
        // 				_id: tempHighestOffer[0].userId._id ? tempHighestOffer[0].userId._id : null,
        // 			};
        // 		} else {
        // 			thisAuctionsOffers[i].highestOffer = {
        // 				price: 0,
        // 				name: "",
        // 				image: "",
        // 				_id: "",
        // 			};
        // 		}
        // 	}

        // 	// const highestOfferTemp = thisAuctionsOffers.reduce((max, min) => (max.amount > min.amount ? max : min));

        // 	await UserAuctions.populate(thisAuctionsOffers, {
        // 		path: "auction",
        // 		populate: {
        // 			path: "assignTokenId",
        // 			populate: [
        // 				{
        // 					path: "collectionId",
        // 					populate: {
        // 						path: "category",
        // 						match: { deletedAt: null },
        // 					},
        // 				},
        // 				{ path: "userId" },
        // 				{ path: "tokenId" },
        // 			],
        // 		},
        // 	});

        // 	await User.populate(thisAuctionsOffers, {
        // 		path: "assignTokenId.userId",
        // 		select: "username email image",
        // 	});
        // }

        // let thisCollections;
        // if (thisAuctionsOffers.length > 0) {
        // 	thisCollections = thisAuctionsOffers.map((collection) => {
        // 		return {
        // 			mainPrices: {
        // 				basePrice: collection.auction ? collection.auction.basePrice : null,
        // 				immediatePrice: collection.auction ? collection.auction.immediatePrice : null,
        // 				bookingPrice: collection.auction ? collection.auction.bookingPrice : null,
        // 			},
        // 			count: collection.auction ? collection.count : null,
        // 			token: collection.auction ? collection.auction.assignTokenId.tokenId : null,
        // 			assignedToken: {
        // 				_id: collection.auction ? collection.auction.assignTokenId._id : null,
        // 				user: collection.auction ? collection.auction.assignTokenId.userId : null,
        // 				status: collection.auction ? collection.auction.assignTokenId.status : null,
        // 			},
        // 			collection: collection.auction ? collection.auction.assignTokenId.collectionId : null,
        // 			highestOffer: collection.highestOffer,
        // 		};
        // 	});
        // }

        // const metadata = temp[0].metadata[0];

        const thisTokens = await UserToken.find({isSlider: true, deletedAt: null})
            .populate("collectionId")
            .select("-__v -updatedAt -deletedAt")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const thisAssignedTokens = await UserAssignedToken.find({
            status: {$in: ["FREE", "IN_AUCTION"]},
            tokenId: {$in: thisTokens.map((token) => token._id)},
        })
            .populate("userId", "_id address username email image createdAt")

            .lean();

        const thisSlider = [];

        const currentDateAuction = new Date();
        for (let i = 0; i < thisTokens.length; i++) {
            const assignedToken = thisAssignedTokens.find((ts) => String(ts.tokenId) === String(thisTokens[i]._id));
            let auction = {};
            if (assignedToken) {
                let highestBid = {};
                let bids = [];
                auction = await UserAuctions.findOne({
                    deletedAt: null,
                    status: "ACTIVE",
                    assignTokenId: ObjectId(assignedToken._id),
                    start: {$lt: currentDateAuction},
                    end: {$gt: currentDateAuction},
                }).lean();

                if (auction) {
                    const bids = await UserAuctionOffer.find({
                        deletedAt: null,
                        status: "REGISTER",
                        auctionId: ObjectId(auction._id),
                        expiresAt: {$gt: currentDateAuction},
                    })
                        .populate("userId", "_id address image username createdAt")
                        .sort("-amount")
                        .lean();
                    highestBid = {...bids[0]};
                }

                const thisOffers = await UserAuctionOffer.find({
                    deletedAt: null,
                    status: "REGISTER",
                    assignedTokenId: ObjectId(assignedToken._id),
                    expiresAt: {$gt: currentDateAuction},
                })
                    .populate("userId", "_id address image username createdAt")
                    .sort("-amount")
                    .lean();

                thisSlider.push({
                    ...thisTokens[i],
                    owner: assignedToken.userId,
                    bids,
                    highestBid,
                    offers: thisOffers,
                    highestoffer: thisOffers[0],
                    assignedToken,
                    auction,
                });
            }
        }

        resolve({data: thisSlider});
    });
}

/**
 * stats user collection ranking
 * @param {*} data
 * @returns
 */
function ranking(data) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, sort, order, categoryId, type, collectionId} = data;

        let query = {type, ...(categoryId ? {categoryId} : {})};

        if (collectionId) {
            query.collectionId = collectionId;
        }

        let count = await UserCollectionStats.aggregate([
            {
                $unwind: "$items",
            },
            {
                $group: {
                    _id: "$items.collectionId",
                    count: {$sum: 1},
                },
            },
        ]);

        let result = await UserCollectionStats.find(query)
            .populate("collectionId")
            .sort({[sort]: order})
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        return resolve({
            total: count?.shift()?.count ?? 0,
            pageSize: limit,
            page,
            data: result,
        });
    });
}

function socketTest() {
    return new Promise(async (resolve, reject) => {
        const data = await new Blog({title: "TEST", description: "yessss"});

        await socketService.emitBidEvent(data.toObject());

        return resolve("OK");
    });
}

async function calculator(data) {
    const {diamondTypeId, rankPosition, days} = data;


    const diamond = await DiamondType.findOne({
        _id: diamondTypeId
    });

    const positions = await Prize.find({
        diamondTypeId: diamond._id
    });


    let main_position;
    for (const position of positions) {
        if (sliceWinners(position.rank, rankPosition)) {
            main_position = position;
            break;
        }
    }

    return {
        rank_position_prize: parseFloat(main_position ? main_position.amount : 0) * days,
    };
};

module.exports = {
    generalSearch,
    searchUsername,
    explore,
    topSellers,
    popularCollections,
    assets,
    featuredUsers,
    trendingArts,
    collectionSearch,
    slider,
    customExplorer,
    ranking,
    featuredCollections,
    socketTest,
    calculator
};

const {HumanError, NotFoundError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {dateQueryBuilder} = require("../../utils/dateQueryBuilder");
const {
    Diamond,
    DiamondType,
    Task,
    Brands,
    User,
    Auction,
    UserDiamond,
    DiamondTrade
} = require("../../databases/mongodb");
const mongoose = require("mongoose");

function addDiamond(data, files) {
    const {
        name,
        description,
        diamondTypeId,
        edition,
        status,
        ipfsImage,
        serialNumber,
        allowedUsageNumber,
        attributes,
        price,
        amount,
        sellCount,

    } = data;
    return new Promise(async (resolve, reject) => {
        let imageData = {};

        if (files) {
            for (let key in files) {
                let file = files[key].shift();

                imageData[key] = [
                    {
                        name: file.newName,
                        key: file.key,
                        location: file.location,
                    },
                ];
            }
        }
        const result = await Diamond.create({
            name: name,
            description,
            diamondTypeId,
            edition,
            status,
            ipfsImage,
            serialNumber,
            allowedUsageNumber,
            attributes,
            price,
            amount,
            sellCount,
            ...imageData,
        });

        resolve("Successful");
    });
}

/**
 * get Diamond list
 */
function getDiamonds(data) {
    return new Promise(async (resolve, reject) => {
        const {
            competitionId,
            diamondTypeId,
            page,
            limit,
            order,
            sort,
            id,
            createdAt,
            searchQuery,
            name,
            description,
        } = data;
        let query = {};

        query.deletedAt = null;

        if (id) query._id = mongoose.Types.ObjectId(id);
        // if (diamondTypeId) query.diamondTypeId = {$in: diamondTypeId};
        if (name) query.name = new RegExp(name, "i");
        if (description) query.description = new RegExp(description, "i");
        if (diamondTypeId) {
            let output = diamondTypeId.map((diamondtypeid) => {
                let ids = mongoose.Types.ObjectId(diamondtypeid);
                return ids;
            });
            query = {"diamondTypeId._id": {$in: [...output]}};
        }

        //searchQuery
        if (searchQuery) {
            query["$or"] = [
                {
                    description: {
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

        let sortObject = {[sort]: order === "DESC" ? -1 : 1};
        if (sort === "price") {
            sortObject = {["diamondTypeId.price"]: order === "DESC" ? -1 : 1};
        }
        const result = await Diamond.aggregate([
            {
                $lookup: {
                    from: "diamondTypes",
                    localField: "diamondTypeId",
                    foreignField: "_id",
                    as: "diamondTypeId",
                },
            },
            {$unwind: {path: "$diamondTypeId", preserveNullAndEmptyArrays: true}},
            {$sort: sortObject},
            {$match: query},
            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}],
                },
            },
        ]).collation({locale: "en"});

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

/**
 * get one Diamond
 */
function getDiamond(id) {
    return new Promise(async (resolve, reject) => {
        let result = await Diamond.findOne({_id: id, deletedAt: null}).populate({path: "diamondTypeId"}).lean();

        if (!result)
            return reject(new NotFoundError(Errors.DIAMOND_NOT_FOUND.MESSAGE, Errors.DIAMOND_NOT_FOUND.CODE, {id}));

        return resolve(result);
    });
}

function addAuctionDiamonds(data) {
    return new Promise(async (resolve, reject) => {
        const {immediatePrice, initialNumber, diamondTypeId} = data;

        const diamondType = await DiamondType.findOne({_id: diamondTypeId}).lean();
        if (!diamondType) return reject(new NotFoundError("diamond type not found", 2029, {diamondTypeId}));

        /*const diamonds = await Diamond.find({status: 'FREE', diamondTypeId: diamondTypeId} , null , {limit: initialNumber});
        if (!diamonds) return reject(new NotFoundError("diamonds not found", 2029, {diamonds}));
        */
        const diamonds = await Diamond.find({
            diamondTypeId: diamondTypeId,
        });

        let i = 0;
        for (let j = 0; j < parseInt(initialNumber); j++) {
            if (diamonds[i].amount > 0)
                await Auction.create({
                    diamondId: diamonds[i]._id,
                    diamondTypeId: diamonds[i].diamondTypeId,
                    price: immediatePrice,
                    status: "ACTIVE",
                });

            i++;
            if (i >= diamonds.length) i = 0;
        }

        resolve("Successful");
    });
}

function getAuctionDiamonds(data) {
    return new Promise(async (resolve, reject) => {
        const {limit, page, diamondTypeId, order, sort, max, min} = data;
        let query = {};

        //query.status = "ACTIVE";
        // query.start = {$lte: Date.now()};
        // query.end = {$gte: Date.now()};

        // if (diamondTypeId) query.diamondTypeId = diamondTypeId;
        if (min || max) {
            query = {$and: [{price: {$lte: max}}, {price: {$gte: min}}]};
        }

        if (diamondTypeId) {
            query = {"diamondId.diamondTypeId._id": mongoose.Types.ObjectId(diamondTypeId)};
        }

        let sortObject = {["createdAt"]: -1};
        if (sort == "immediatePrice") {
            sortObject = {["price"]: order === "DESC" ? -1 : 1};
        }
        if (sort == "createdAt") {
            sortObject = {["createdAt"]: order === "DESC" ? -1 : 1};
        }
        const result = await Auction.aggregate([
            {
                $lookup: {
                    from: "diamonds",
                    localField: "diamondId",
                    foreignField: "_id",
                    as: "diamondId",
                },
            },
            {$unwind: {path: "$diamondId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "diamondTypes",
                    localField: "diamondId.diamondTypeId",
                    foreignField: "_id",
                    as: "diamondId.diamondTypeId",
                },
            },
            {$unwind: {path: "$diamondId.diamondTypeId", preserveNullAndEmptyArrays: true}},
            {$match: {$and: [query, {status: "ACTIVE"}]}},
            //{ $sort: { $or: [sortObject , {"createdAt" : 1 }] } }
            {
                $group: {
                    _id: {
                        diamondId: "$diamondId._id",
                    },
                    doc: {
                        $first: "$$ROOT",
                    },
                },
            },
            {
                $replaceRoot: {
                    newRoot: "$doc",
                },
            },
            {$sort: sortObject},
            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}],
                },
            },
        ]).collation({locale: "en"});

        const items = result[0].data;
        const metadata = result[0].metadata[0];

        resolve({
            total: metadata?.total ?? 0,
            pageSize: limit,
            page: metadata?.page ?? page,
            data: items,
        });

        // const count = await Auction.countDocuments(query);
        // const items = await Auction.find(query)
        // 	.select("-__v")
        // 	.populate({ path: "diamondId", populate: { path: "diamondTypeId", match: { name: { $ne: "Common" } } } })
        // 	.sort({ [sort]: order })
        // 	.skip((page - 1) * limit)
        // 	.limit(limit)
        // 	.lean();

        // resolve({
        // 	total: count ?? 0,
        // 	pageSize: limit,
        // 	page,
        // 	data: items,
        // });
    });
}

function getAuctionDiamondsByManager(data) {
    return new Promise(async (resolve, reject) => {
        const {limit, page, diamondType, user, order, status, searchQuery, sort, price, diamond} = data;
        let query = {deletedAt: null};

        // query.start = {$lte: Date.now()};
        // query.end = {$gte: Date.now()};

        if (diamond) {
            query = {"diamondId.name": new RegExp(diamond, "i")};
        }
        if (diamondType) {
            query = {"diamondTypeId.name": new RegExp(diamondType, "i")};
        }
        if (user) {
            query = {"userId.username": new RegExp(user, "i")};
        }

        if (price) {
            //query.balanceIn = balanceIn;
            query.price = {$eq: price};
        }

        // {$eq: ["$status", "ACTIVE"]},
        // if (price) {
        // 	query.price = new RegExp(price, "i");
        // }
        if (status) {
            query.status = {$in: [...status]};
        }

        //searchQuery
        if (searchQuery) {
            query["$or"] = [
                {
                    price: {$eq: searchQuery},
                },
                {
                    status: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    "diamondId.name": {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    "diamondType.name": {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
            ];
        }

        let sortObject = {[sort]: order === "DESC" ? -1 : 1};
        if (sort === "price") {
            sortObject = {["price"]: order === "DESC" ? -1 : 1};
        }

        const result = await Auction.aggregate([
            {
                $lookup: {
                    from: "diamonds",
                    localField: "diamondId",
                    foreignField: "_id",
                    as: "diamondId",
                },
            },
            {$unwind: {path: "$diamondId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "diamondTypes",
                    localField: "diamondTypeId",
                    foreignField: "_id",
                    as: "diamondTypeId",
                },
            },
            {$unwind: {path: "$diamondTypeId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                },
            },
            {$unwind: {path: "$userId", preserveNullAndEmptyArrays: true}},
            {$match: query},
            {$sort: sortObject},
            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}],
                },
            },
        ]).collation({locale: "en"});

        const items = result[0].data;
        const metadata = result[0].metadata[0];

        resolve({
            total: metadata?.total ?? 0,
            pageSize: limit,
            page: metadata?.page ?? page,
            data: items,
        });

        // const count = await Auction.countDocuments(query);
        // const items = await Auction.find(query)
        // 	.select("-__v")
        // 	.populate({ path: "diamondId", populate: { path: "diamondTypeId", match: { name: { $ne: "Common" } } } })
        // 	.sort({ [sort]: order })
        // 	.skip((page - 1) * limit)
        // 	.limit(limit)
        // 	.lean();

        // resolve({
        // 	total: count ?? 0,
        // 	pageSize: limit,
        // 	page,
        // 	data: items,
        // });
    });
}

const getAuctionDiamondByManager = async (id) => {
    let result = await Auction.findOne({_id: id})
        .populate([
            {
                path: "diamondId",
                model: "diamonds",
            },
            {
                path: "diamondTypeId",
                model: "diamondTypes",
            },
            {
                path: "userId",
                model: "users",
            },
        ])
        .lean();

    if (!result)
        throw new NotFoundError(Errors.AUCTION_DIAMOND_NOT_FOUND.MESSAGE, Errors.Diamond_TYPE_NOT_FOUND.CODE, {id});

    return result;
};

function getDiamondByUserDiamondId(id) {
    return new Promise(async (resolve, reject) => {
        let result = await UserDiamond.findOne({_id: id})
            .populate([
                {
                    path: "diamondId",
                    model: "diamonds",
                },
                {
                    path: "userId",
                    model: "users",
                },
                {
                    path: "auctionId",
                    model: "auctions",
                },
            ])
            .lean();

        if (!result)
            return reject(new NotFoundError(Errors.DIAMOND_NOT_FOUND.MESSAGE, Errors.DIAMOND_NOT_FOUND.CODE, {id}));

        return resolve(result);
    });
}

function getDiamondByUserDiamond(id) {
    return new Promise(async (resolve, reject) => {
        let result = await UserDiamond.findOne({_id: id})
            .populate([
                {
                    path: "diamondId",
                    model: "diamonds",
                },
                {
                    path: "userId",
                    model: "users",
                },
                {
                    path: "auctionId",
                    model: "auctions",
                },
            ])
            .lean();

        if (!result)
            return reject(new NotFoundError(Errors.DIAMOND_NOT_FOUND.MESSAGE, Errors.DIAMOND_NOT_FOUND.CODE, {id}));

        return resolve(result);
    });
}


/**
 * create assigned card
 */
async function createAssignedCard(data) {
    const {diamondTypeId, userId} = data;
    const auction = await Auction.findOne({diamondTypeId: diamondTypeId, status: 'ACTIVE'});
    if (!auction)
        return new HumanError('auction not found')

    auction.status = 'RESERVED'
    await auction.save()

    await UserDiamond.create({
        diamondId: auction.diamondId,
        userId: userId,
        status: 'GIFT'
    })

    await DiamondTrade.create({
        payeeId: userId,
        auctionId: auction._id
    })

    return "Successful";
}

/**
 * get assigned card list
 */
async function getAssignedCard(data) {
    const {
        user,
        diamond,
        type,
        status,
        page,
        limit,
        order,
        sort,
        createdAt,
        id,
        searchQuery,
        userId,
        sortCard,
        orderCard,
        orderUser,
        sortUser,
        diamondTypeId
    } = data;

    let query = {};

    if (id) query.id = id;
    if (type) query.type = type;
    if (userId) query.userId = userId;
    if (status) query.status = status;
    if (diamondTypeId) query.diamondTypeId = diamondTypeId;
    // if (card) query3.name = { [postgres.Op.iLike]: "%" + card + "%" };

    // if (user)
    // 	query[postgres.Op.or] = [
    // 		{ "$user.name$": { [postgres.Op.iLike]: `%${user}%` } },
    // 		{ "$user.email$": { [postgres.Op.iLike]: `%${user}%` } }
    // 	];

    // if (createdAt) {
    // 	const { start, end } = dateQueryBuilder(createdAt);
    // 	query4.createdAt = { [postgres.Op.gte]: start, [postgres.Op.lte]: end };
    // }

    // if (searchQuery) query3.name = { [postgres.Op.iLike]: `%${searchQuery}%` };

    // if (sortUser && orderUser) order2 = [[{ model: postgres.User }, sortUser, orderUser]];
    // else if (orderCard && sortCard) order2 = [[{ model: postgres.Card }, sortCard, orderCard]];
    // else order2 = [[sort, order]];

    let count = await UserDiamond.countDocuments(
        query,
    )
    let result = await UserDiamond.find(
        query,
    ).populate({path: 'userId'})
        .populate({path: 'diamondId'})
        .select("-__v")
        .sort({createdAt: "DESC"})
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    return {
        total: count,
        pageSize: limit,
        page,
        data: result
    };
}

module.exports = {
    getDiamonds,
    getDiamond,
    addAuctionDiamonds,
    addDiamond,
    getAuctionDiamondsByManager,
    getAuctionDiamonds,
    getAuctionDiamondByManager,
    getDiamondByUserDiamondId,
    getDiamondByUserDiamond,
    createAssignedCard,
    getAssignedCard
};

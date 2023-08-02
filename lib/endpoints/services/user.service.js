const {NotFoundError, HumanError, ConflictError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {
    User,
    UserFollowLike,
    UserAuctionOffer,
    UserExplore,
    UserAssignedToken,
    UserActivity,
    UserCollection,
    UserDiamond,
    AgentReport,
    Fee,
    Asset,
    AgentLink,
    AgentLinkStatistic,
    ReferralReward
} = require("../../databases/mongodb");
const {isJson, password} = require("../../utils");
const {populate} = require("../../databases/mongodb/models/CollectionEngagement");
const {serializeUser} = require("../../utils/serializer/user.serializer");
const {dateQueryBuilder} = require("../../utils/dateQueryBuilder");
const uuid = require("uuid");

function addUsers(data, files, fileValidationError) {
    return new Promise(async (resolve, reject) => {
        if (fileValidationError) {
            return reject(
                new ConflictError(Errors.FILE_NOT_SUPPORTED.MESSAGE, Errors.FILE_NOT_SUPPORTED.CODE, {
                    fileValidationError,
                }),
            );
        }
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
        if (data.password) {
            const _password = await password.generate(data.password);
            data.password = _password.hash;
            data.salt = _password.salt;
        }

        if (data.username) {
            const existUserByUsername = await User.findOne({username: data.username});
            if (existUserByUsername) {
                return reject(
                    new ConflictError(Errors.DUPLICATE_USER_USERNAME.MESSAGE, Errors.DUPLICATE_USER_USERNAME.CODE),
                );
            }
        }
        if (data.email) {
            const existUserByEmail = await User.findOne({email: data.email});
            if (existUserByEmail) {
                return reject(new ConflictError(Errors.DUPLICATE_USER_EMAIL.MESSAGE, Errors.DUPLICATE_USER_EMAIL.CODE));
            }
        }
        if (data.address) {
            const existUserByAddress = await User.findOne({address: data.address});
            if (existUserByAddress) {
                return reject(
                    new ConflictError(Errors.DUPLICATE_USER_ADDRESS.MESSAGE, Errors.DUPLICATE_USER_ADDRESS.CODE),
                );
            }
        }

        if (data.link) {
            if (!isJson(data.link)) {
                return reject(new HumanError(Errors.INVALID_LINK.MESSAGE, Errors.INVALID_LINK.CODE));
            }
        }
        let referralCode = uuid.v4()?.split("-")?.shift();

        const result = await User.create({...data, referralCode, ...imageData});
        if (!result) return reject(new HumanError("error while creating user", 400));

        if (data.level === "AGENT") {
            const bnbAsset = await Asset.findOne({title: "BNB_SYSTEM"});

            // Find max fee level id
            const lastFeeTemp = await Fee.find({}).limit(1).sort({userLevel: "DESC"});
            const lastFee = lastFeeTemp[0];

            let lastId = 1;
            if (lastFee) lastId += lastFee.userLevel;

            // Create new fee (referral reward = fee)
            const newFee = await Fee.create({
                userLevel: lastId,
                userType: "AGENT",
                referralReward: data.fee,
                assetId: bnbAsset._id,
            });

            // result.update({levelId: newFee.userLevel});
            result.levelId = newFee.userLevel;
            result.save();

            const existReport = await AgentReport.findOne({agentId: result._id});
            if (!existReport) await AgentReport.create({agentId: result._id});
        }

        return resolve("Successful");
    });
}

function editUsers(data, files, userEntity, fileValidationError) {
    return new Promise(async (resolve, reject) => {
        if (fileValidationError) {
            return reject(
                new ConflictError(Errors.FILE_NOT_SUPPORTED.MESSAGE, Errors.FILE_NOT_SUPPORTED.CODE, {
                    fileValidationError,
                }),
            );
        }
        const user = await User.findById(userEntity.id);
        if (!user) {
            return reject(new HumanError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE, {id: data.id}));
        }
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
        let update = {};
        if (data.password) {
            const _password = await password.generate(data.password);

            update.password = _password.hash;
            update.salt = _password.salt;
        }

        if (data.username) {
            const existUserByUsername = await User.findOne({username: data.username});
            if (existUserByUsername && existUserByUsername.id != userEntity.id) {
                return reject(
                    new ConflictError(Errors.DUPLICATE_USER_USERNAME.MESSAGE, Errors.DUPLICATE_USER_USERNAME.CODE),
                );
            }
            update.username = data.username.toLocaleLowerCase();
        }
        if (data.description) update.description = data.description;
        if (data.email) {
            const existUserByEmail = await User.findOne({email: data.email});
            if (existUserByEmail && existUserByEmail.id != userEntity.id) {
                return reject(new ConflictError(Errors.DUPLICATE_USER_EMAIL.MESSAGE, Errors.DUPLICATE_USER_EMAIL.CODE));
            }
            update.email = data.email.toLocaleLowerCase();
        }
        if (data.link) {
            if (!isJson(data.link)) {
                return reject(new HumanError(Errors.INVALID_LINK.MESSAGE, Errors.INVALID_LINK.CODE));
            }
            update.link = JSON.parse(data.link);
        }

        if (data.level) update.level = data.level;

        if (data.level === "AGENT" && data.fee) {
            const bnbAsset = await Asset.findOne({title: "BNB_SYSTEM"});

            if (!user.levelId) {
                const lastFeeTemp = await Fee.find({}).limit(1).sort({userLevel: "DESC"});

                const lastFee = lastFeeTemp[0];

                let levelId = 1;
                if (lastFee) levelId += +lastFee.userLevel;

                const newFee = await Fee.create({
                    userLevel: levelId,
                    userType: "AGENT",
                    referralReward: data.fee,
                    assetId: bnbAsset._id,
                });

                update.levelId = newFee.userLevel;
            } else {
                const existFee = await Fee.findOne({
                    userType: "AGENT",
                    userLevel: user.levelId,
                });

                if (existFee) {
                    existFee.referralReward = data.fee;
                    existFee.assetId = bnbAsset._id;
                    existFee.save();
                } else {
                    await Fee.create({
                        userLevel: user.levelId,
                        userType: "AGENT",
                        referralReward: data.fee,
                        assetId: bnbAsset._id,
                    });
                }
            }
        }

        let result = await User.findOneAndUpdate(
            {_id: userEntity.id},
            {
                ...update,
                ...imageData,
            },
            {
                new: true,
            },
        );

        //update user name in explorers table
        if (result)
            await UserExplore.findOneAndUpdate(
                {type: "USERS", typeId: result.id},
                {
                    type: "USERS",
                    typeId: result.id,
                    name: result.username,
                    address: result.address,
                    userAvatar: result.image.length > 0 ? result.image[0].location : null,
                },
                {upsert: true},
            );

        return resolve("Successful");
    });
}

function editUsersByManager(data, files, fileValidationError) {
    return new Promise(async (resolve, reject) => {
        if (fileValidationError) {
            return reject(
                new ConflictError(Errors.FILE_NOT_SUPPORTED.MESSAGE, Errors.FILE_NOT_SUPPORTED.CODE, {
                    fileValidationError,
                }),
            );
        }
        const user = await User.findById(data.id);
        if (!user) {
            return reject(new HumanError(Errors.DUPLICATE_USER_USERNAME.MESSAGE, Errors.DUPLICATE_USER_USERNAME.CODE));
        }
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
        let update = {};
        if (data.address) update.address = data.address;
        if (data.username) update.username = data.username.toLocaleLowerCase();
        if (data.description) update.description = data.description;
        if (data.email) update.email = data.email.toLocaleLowerCase();
        if (typeof data.isVerified === "boolean") update.isVerified = data.isVerified;
        if (typeof data.isFeatured === "boolean") update.isFeatured = data.isFeatured;
        if (data.status) update.status = data.status;
        if (data.link) {
            if (!isJson(data.link)) {
                return reject(new HumanError(Errors.INVALID_LINK.MESSAGE, Errors.INVALID_LINK.CODE));
            }
            update.link = JSON.parse(data.link);
        }


        // if (update.address) {
        // 	await Web3Token.verify(update.address);
        // }

        if (data.username) {
            const existUserByUsername = await User.findOne({username: data.username});
            if (existUserByUsername && existUserByUsername.id != user.id) {
                return reject(
                    new ConflictError(Errors.DUPLICATE_USER_USERNAME.MESSAGE, Errors.DUPLICATE_USER_USERNAME.CODE),
                );
            }
        }
        if (data.email) {
            const existUserByEmail = await User.findOne({email: data.email});
            if (existUserByEmail && existUserByEmail.id != user.id) {
                return reject(new ConflictError(Errors.DUPLICATE_USER_EMAIL.MESSAGE, Errors.DUPLICATE_USER_EMAIL.CODE));
            }
        }
        if (data.address) {
            const existUserByAddress = await User.findOne({address: data.address});
            if (existUserByAddress && existUserByAddress.id != user.id) {
                return reject(
                    new ConflictError(Errors.DUPLICATE_USER_ADDRESS.MESSAGE, Errors.DUPLICATE_USER_ADDRESS.CODE),
                );
            }
        }
        if (data.password) {
            const _password = await password.generate(data.password);

            update.password = _password.hash;
            update.salt = _password.salt;
        }

        if (data.level) update.level = data.level;

        if (data.level === "AGENT" && data.fee) {
            const bnbAsset = await Asset.findOne({title: "BNB_SYSTEM"});

            if (!user.levelId) {
                const lastFeeTemp = await Fee.find({}).limit(1).sort({userLevel: "DESC"});

                const lastFee = lastFeeTemp[0];

                let levelId = 1;
                if (lastFee) levelId += +lastFee.userLevel;

                const newFee = await Fee.create({
                    userLevel: levelId,
                    userType: "AGENT",
                    referralReward: data.fee,
                    assetId: bnbAsset._id,
                });

                update.levelId = newFee.userLevel;
            } else {
                const existFee = await Fee.findOne({
                    userType: "AGENT",
                    userLevel: user.levelId,
                });

                if (existFee) {
                    existFee.referralReward = data.fee;
                    existFee.assetId = bnbAsset._id;
                    existFee.save();
                } else {
                    await Fee.create({
                        userLevel: user.levelId,
                        userType: "AGENT",
                        referralReward: data.fee,
                        assetId: bnbAsset._id,
                    });
                }
            }
        }

        await User.findByIdAndUpdate(
            data.id,
            {
                ...update,
                ...imageData,
            },
            {
                new: true,
            },
        );

        return resolve("Successful");
    });
}

function deleteUsers(id) {
    return new Promise(async (resolve, reject) => {
        const result = await User.findOneAndUpdate({_id: id}, {$set: {deletedAt: new Date()}});

        if (!result)
            return reject(new NotFoundError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE, {id}));

        return resolve("Successful");
    });
}

function findUserById(id) {
    return new Promise(async (resolve, reject) => {
        let result = await User.findById(id).lean();

        if (result.level === "AGENT") {
            result["feeData"] = await Fee.findOne({
                userLevel: result.levelId,
                userType: "AGENT",
            });
        }

        if (!result)
            return reject(new NotFoundError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE, {id}));

        return resolve(result);
    });
}

function inviteLinkHandler(res, code) {
    return new Promise(async (resolve, reject) => {
        try {
            const agentLink = await AgentLink.findOne({
                code,
            });
            if (!agentLink) {
                return reject(new NotFoundError("agent link not found", 400, {code}));
            }

            const agent = User.findOne({_id: AgentLink.agentId});
            await AgentLinkStatistic.create({agentLinkId: agentLink._id});
            let redirectUrl = process.env.NODE_ENV === "development" ? "https://ftvnft.com/" : "https://ftvio.com/";

            if (agentLink.type === "REGISTER") {
                agentLink.clickCount = agentLink.clickCount + 1;
                await agentLink.save();
                redirectUrl += `connect?ref=${agent.referralCode}`;
            }

            return res.redirect(redirectUrl);
        } catch (error) {
            return reject(error);
        }
    });
}

function getUsers(data) {
    return new Promise(async (resolve, reject) => {
        const {id, page, limit, order, username, email, isVerified, status, createdAt, address, searchQuery} = data;
        const query = {deletedAt: null};
        const sort = {};

        // user filters
        if (username) {
            query.username = new RegExp(username, "i");
        }
        if (email) {
            query.email = new RegExp(email, "i");
        }
        if (address) {
            query.address = new RegExp(address, "i");
        }
        if (status) {
            query.status = {$in: [...status]};
        }
        if (isVerified) query.isVerified = {$in: isVerified.map((flag) => (flag === "true" ? true : false))};

        if (createdAt) {
            const {start, end} = dateQueryBuilder(createdAt);
            query.createdAt = {$gte: start, $lte: end};
        }
        //if (query.$or.length === 0) delete query.$or;

        //sort
        if (order == "DESC") {
            sort.createdAt = -1;
        } else if (order == "ASC") {
            sort.createdAt = +1;
        }

        //searchQuery
        if (searchQuery) {
            query["$or"] = [
                {
                    address: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    email: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    username: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    status: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
            ];
        }

        const result = await User.aggregate([
            {$match: query},
            {$sort: sort},
            // {$addFields: {fieldType: {$type: `$${sort}`}}},
            {$project: {fieldType: 0}},
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
 * get users data by manager
 * @param {*} data
 * @returns
 */
async function getUsersSelector(data) {

    const {page, limit, order, searchQuery, sort} = data;
    const sortObj = {};
    sortObj[sort || "createdAt"] = order;
    const query = {};
    if (searchQuery) {
        query["$or"] = [
            {
                username: {
                    $regex: searchQuery || "",
                    $options: "i",
                },
            },
            {
                email: {
                    $regex: searchQuery || "",
                    $options: "i",
                },
            },
        ];
    }

    const count = await User.countDocuments(query);
    const result = await User.find(query)
        .select("-__v")
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(); // == raw: true

    return ({
        total: count ?? 0,
        pageSize: limit,
        page,
        data: result,
    });
}

function getUser(id, requsetedUserId) {
    return new Promise(async (resolve, reject) => {
        let user;
        let result = await User.findOne({_id: id, deletedAt: null}).lean();

        if (!result)
            return reject(new NotFoundError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE, {id}));

        const collectionsCount = await UserCollection.countDocuments({user: id, deletedAt: null});

        if (requsetedUserId) {
            const getRequsetedUser = await User.findOne({_id: requsetedUserId, deletedAt: null});
            user = await serializeUser(result, getRequsetedUser);
            return resolve(user);
        }

        const nftsCount = await UserAssignedToken.countDocuments({
            userId: id,
            status: {$in: ["FREE", "IN_AUCTION"]},
            deletedAt: null,
        });

        const diamondsCount = await UserDiamond.countDocuments({
            userId: id,
            deletedAt: null,
        });

        const favoriteToken = await UserFollowLike.findOne({userId: id}).populate({
            path: "likedToken",
            match: {deletedAt: null},
        });

        //UserFollowLike;
        let followersCount = await UserFollowLike.countFollowers(result._id);
        let followingCount = await UserFollowLike.countFollowing(result._id);
        let favoriteTokenCount = favoriteToken ? favoriteToken.likedToken.length : 0;

        // const tokenIds = assignedTokens.map((at) => String(at.tokenId));
        // const filtered = assignedTokens.filter(({ tokenId }, index) => !tokenIds.includes(String(tokenId), index + 1));
        return resolve({
            ...result,
            collectionsCount,
            nftsCount,
            followersCount,
            followingCount,
            favoriteTokenCount,
            diamondsCount,
        });
    });
}

function tabsInfo(data, user) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, order, sort, type /* collections, search */} = data;
        const sortObj = {};
        sortObj[sort || "createdAt"] = order;

        /* const mainQuery = {
            $or: [
                {
                    "tokenId.name": search,
                },
                {
                    "assignedTokenId.tokenId.name": search,
                },
                {
                    "tokenId.name": search,
                },
            ],
        }; */

        // On Sale
        const onSalesCount = await UserAssignedToken.countDocuments({
            userId: user.id,
            status: "IN_AUCTION" /* ...mainQuery */,
        });
        const onSales = await UserAssignedToken.find({userId: user.id, status: "IN_AUCTION" /* ...mainQuery */})
            .populate("tokenId")
            .select("-__v")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Collectable
        const collectableCount = await UserAuctionOffer.countDocuments({
            userId: user.id,
            status: "ACCEPTED" /* ...mainQuery */,
        });
        const collectable = await UserAuctionOffer.find({userId: user.id, status: "ACCEPTED" /* ...mainQuery */})
            .populate({path: "assignedTokenId", populate: {path: "tokenId"}})
            .select("-__v")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // created
        const createdCount = await UserAssignedToken.countDocuments({
            userId: user.id,
            status: "FREE" /* ...mainQuery */,
        });
        const created = await UserAssignedToken.find({userId: user.id, status: "FREE" /* ...mainQuery */})
            .populate("tokenId")
            .select("-__v")
            .sort(sortObj)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const query = {
            $or: [
                {
                    from: user.address,
                },
                {
                    to: user.address,
                },
            ],
        };

        if (type) query.type = type;
        const activitiesCount = await UserActivity.countDocuments(query).lean();
        const activities = await UserActivity.find(query).lean();

        return resolve({
            onSales: {
                total: onSalesCount ?? 0,
                pageSize: limit,
                page,
                data: onSales,
            },
            collectable: {
                total: collectableCount ?? 0,
                pageSize: limit,
                page,
                data: collectable,
            },
            created: {
                total: createdCount ?? 0,
                pageSize: limit,
                page,
                data: created,
            },
            activities: {
                total: activitiesCount ?? 0,
                pageSize: limit,
                page,
                data: activities,
            },
        });
    });
}

async function referral(user) {
    //get count of registered user by this referral code
    let friendsInvited = await User.countDocuments({referredCode: user.referralCode});

    let fee = 3 + " %";

    if (user.level === "AGENT") {
        const feeLevel = Fee.findOne({
            _id: user.levelId
        });

        fee = feeLevel ? parseFloat(feeLevel.referralReward) * 100 + " %" : "0 %";
    }

    return {
        code: user.referralCode,
        friendsInvited: friendsInvited,
        prize: fee
    };
}

async function referralHistory({page, limit, order}, user) {
    let offset = (page - 1) * limit;

    if (!user) throw new NotFoundError("user not found", 400);

    const query = {
        userId: user._id,
    };
    console.log('u = ', user._id)
    let result = await ReferralReward.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "referredUserId",
                foreignField: "_id",
                as: "referredUserId",

            }
        },
        {$unwind: {path: "$referredUserId", preserveNullAndEmptyArrays: true}},
        {
            $lookup: {
                from: "assets",
                localField: "assetId",
                foreignField: "_id",
                as: "assetId",
            },
        },

        {$match: query},
        {$group: {_id: {referredUserId: "$referredUserId", assetId: "$assetId"}, totalCommission: {$sum: "$amount"}}},
    ])

    // attributes: [
    //     [
    //         postgres.sequelize.fn("SUM", postgres.sequelize.cast(postgres.sequelize.col("amount"), "decimal")),
    //         "totalCommission"
    //     ],
    //     "referredUserId"
    // ],
    //     include: [
    //     { model: postgres.User, as: "referredUser", attributes: ["name", "avatar", "email"] },
    //     { model: postgres.Asset, attributes: ["coin"] }
    // ],
    //     group: ["referralReward.referredUserId", "referredUser.id", "referralReward.assetId", "asset.id"]

    return result;
}

module.exports = {
    findUserById,
    deleteUsers,
    editUsers,
    addUsers,
    getUsers,
    getUsersSelector,
    editUsersByManager,
    getUser,
    tabsInfo,
    inviteLinkHandler,
    referralHistory,
    referral
};

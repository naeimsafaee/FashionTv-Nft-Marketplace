const {NotFoundError, HumanError, ConflictError, NotAuthorizedError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const mongoose = require("mongoose");
const {dateQueryBuilder} = require("../../utils/dateQueryBuilder");
const {
    Competition,
    Task,
    DiamondType,
    Diamond,
    UserTask,
    UserDiamond,
    UserToken,
    UserFollowLike,
    Prize,
    Leaderboard,
    MatchParticipantTeam,
    UserNotification,
    UserPrize,
    MatchParticipant,
    UserWallet,
    Asset,
    Blog,
    UserCollection,
    Category,
} = require("../../databases/mongodb");

/**
 * get Competition list
 */
function getCompetitions(data) {
    return new Promise(async (resolve, reject) => {
        const {status, page, limit, order, sort, title, id, searchQuery, createdAt, startAt, endAt} = data;
        let query = {};
        query.deletedAt = null;
        if (status) query.status = {$in: status};

        if (title) query.title = {$regex: ".*" + title + ".*"};
        if (id) query._id = id;

        if (createdAt) {
            const {start, end} = dateQueryBuilder(createdAt);
            query.createdAt = {$gte: start, $lte: end};
        }
        if (startAt) {
            const {start, end} = dateQueryBuilder(startAt);
            query.startAt = {$gte: start, $lte: end};
        }
        if (endAt) {
            const {start, end} = dateQueryBuilder(endAt);
            query.endAt = {$gte: start, $lte: end};
        }
        if (searchQuery) {
            query.$or = [
                {
                    title: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    status: {$regex: searchQuery || "", $options: "i"},
                },
            ];
        }

        const count = await Competition.countDocuments(query);
        const items = await Competition.find(query)
            .select("-__v")
            .sort({[sort]: order})
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

/**
 * get one Competition
 */
function getCompetition(id) {
    return new Promise(async (resolve, reject) => {
        const result = await Competition.findOne({_id: id, deletedAt: null}).lean();

        if (!result)
            return reject(
                new NotFoundError(Errors.COMPETITION_NOT_FOUND.MESSAGE, Errors.COMPETITION_NOT_FOUND.CODE, {id}),
            );

        return resolve(result);
    });
}

/**
 * create Competition
 */
function addCompetition(data) {
    return new Promise(async (resolve, reject) => {
        const {title, startAt, endAt, status} = data;
        let result = await Competition.create({
            title,
            startAt,
            endAt,
            status,
        });
        if (!result) return reject(new HumanError(Errors.ADD_FAILED.MESSAGE, Errors.ADD_FAILED.CODE));

        resolve("Successful");
    });
}

/**
 * update Competition
 */
function editCompetition(id, title, status, io) {
    return new Promise(async (resolve, reject) => {
        const competition = await Competition.findOne({_id: id, deletedAt: null});
        if (!competition)
            return reject(
                new NotFoundError(Errors.COMPETITION_NOT_FOUND.MESSAGE, Errors.COMPETITION_NOT_FOUND.CODE, {id}),
            );
        if (competition.status === "COMPLETED")
            return reject(new NotFoundError(Errors.COMPETITION_CLOSE.MESSAGE, Errors.COMPETITION_CLOSE.CODE, {id}));

        if (title) competition.title = title;
        if (status) competition.status = status;

        await competition.save();
        if (status && status === "COMPLETED" && competition) await completeCompetitions(competition, io);

        resolve("Successful");
    });
}

async function completeCompetitions(competition, io) {
    // const session = await mongoose.startSession();

    try {
        // session.startTransaction();
        const cardTypes = await DiamondType.find();

        let notifList = [];

        for (let o = 0; o < cardTypes.length; o++) {
            const diamondTypeId = cardTypes[o]._id;

            let leaderboards = await MatchParticipantTeam.find({
                competitionId: competition._id,
                diamondTypeId: diamondTypeId,
                deletedAt: null,
            })
                .populate({
                    path: "diamondId",
                })
                .populate({path: "userId"})
                .sort({score: "DESC"});

            let prizes = await Prize.find({diamondTypeId: diamondTypeId, deletedAt: null}).sort({amount: "DESC"});

            for (let j = 0; j < leaderboards.length; j++) {
                const rank = j + 1;
                const user = leaderboards[j].userId;
                const score = leaderboards[j].score;
                const diamondId = leaderboards[j].diamondId;

                if (!user) {
                    continue;
                }

                for (let k = 0; k < prizes.length; k++) {
                    const prize = prizes[k];

                    if (sliceWinners(prize.rank, rank)) {
                        let userWallet = await UserWallet.findOne({
                            userId: user._id,
                            assetId: prize.assetId,
                        });

                        if (!userWallet) {
                            userWallet = await UserWallet.create(
                                {userId: user._id, assetId: prize.assetId}
                                // , {session}
                            );
                        }
                        // await systemWallet.decrement("amount", {by: +prize.amount, transaction});

                        // await userWallet.increment("amount", {by: +prize.amount, transaction});
                        userWallet.amount += parseFloat(prize.amount);
                        await userWallet.save({
                            // session
                        });

                        await UserPrize.create(
                            {
                                userId: user._id,
                                rank: rank,
                                diamondTypeId: diamondTypeId,
                                competitionId: competition._id,
                                assetId: prize.assetId,
                                amount: prize.amount,
                            },
                            // {
                            // 	session
                            // },
                        );

                        const card = await Diamond.findOne({_id: diamondId});
                        const cardType = await DiamondType.findOne({_id: diamondTypeId});

                        notifList.push({
                            userId: user._id,
                            rank: rank,
                            score: score,
                            prize: prize.amount,
                            competition_name: competition.title,
                            // card_name: card.name,
                            // cardType_name: cardType.name
                        });

                        break;
                    }
                }
            }
        }

        if (notifList.length > 0) {
            for (const item of notifList) {
                let notif = await UserNotification.create(
                    {
                        userId: item.userId,
                        title: `Reward`,
                        description: `You became rank ${item.rank} and earned ${item.prize} VIO`,
                    }
                    // , {session}
                );

                if (io) {
                    io.to(`UserId:${item.userId}`).emit("notification", JSON.stringify(notif));

                    let ww = await UserWallet.find({userId: item.userId}).lean()
                    io.to(`UserId:${item.userId}`).emit("wallet", JSON.stringify(ww));

                }
            }
        }

        // throw (new HumanError(Errors.ITEM_NOT_FOUND.MESSAGE, Errors.ITEM_NOT_FOUND.CODE));
        // await session.commitTransaction();
    } catch (e) {
        // await session.abortTransaction();
        throw e;
    }
    // session.endSession();
}

/**
 * delete Competition
 */
function deleteCompetition(id) {
    return new Promise(async (resolve, reject) => {
        let result = await Competition.findOneAndUpdate(
            {_id: id, deletedAt: null},
            {$set: {deletedAt: new Date()}},
        );

        if (!result)
            return reject(new HumanError(Errors.ITEM_NOT_FOUND.MESSAGE, Errors.ITEM_NOT_FOUND.CODE, {id: id}));

        resolve("Successful");
    });
}

async function countCompetitionParticipant(data) {
    const {competitionId} = data;
    let array = [];
    let cardTypes = await DiamondType.find();

    for (let i = 0; i < cardTypes.length; i++) {
        let x = 0;

        x = parseInt(
            await MatchParticipantTeam.countDocuments({
                competitionId: competitionId,
                diamondTypeId: cardTypes[i]._id,
            }),
        );

        array.push({
            cardTypeId: cardTypes[i]._id,
            cardTypeName: cardTypes[i].name + " competition",
            cardTypeImage: cardTypes[i].image,
            participant: x,
        });
    }

    return array;
}

async function competitionRank(data) {
    const {competitionId, cardTypeId, userName} = data;
    let query = {};

    if (competitionId) query.competitionId = competitionId;
    if (cardTypeId) query.diamondTypeId = cardTypeId;

    // if (userName) {
    //     query[postgres.Op.or] = [
    //         {"$user.name$": {[postgres.Op.iLike]: `%${userName}%`}},
    //         {"$user.email$": {[postgres.Op.iLike]: `%${userName}%`}}
    //     ];
    // }

    let array = [];

    const prizes = await UserPrize.find({
        competitionId: competitionId,
        diamondTypeId: cardTypeId,
    })
        .populate({path: "userId", select: "image username address"})
        .sort({rank: "ASC"});

    for (let i = 0; i < prizes.length; i++) {
        let match = await MatchParticipantTeam.findOne({
            competitionId: prizes[i].competitionId,
            userId: prizes[i].userId,
        });

        array.push({
            user: prizes[i].userId,
            rank: prizes[i].rank,
            score: parseInt(match.score),
        });
    }

    return array;
}

/**
 * create task
 */
function addTask(data, files) {
    return new Promise(async (resolve, reject) => {
        const {title, description, diamondTypeId, competitionId} = data;

        let image = {};

        if (files && Object.keys(files).length) {
            for (let key in files) {
                let file = files[key].shift();

                image[key] = [
                    {
                        name: file.newName,
                        key: file.key,
                        location: file.location,
                    },
                ];
            }
        }

        let result = await Task.create({
            competitionId,
            diamondTypeId,
            title,
            description,
            ...image,
        });
        if (!result) return reject(new HumanError(Errors.ADD_FAILED.MESSAGE, Errors.ADD_FAILED.CODE));

        resolve("Successful");
    });
}

/**
 * get task list
 */
function getTasks(data) {
    const {competitionId, diamondTypeId, page, limit, order, id, createdAt, searchQuery, title} = data;
    return new Promise(async (resolve, reject) => {
        let query = {};
        let sort = {};

        // const ghostType = await CardType.findOne({ where: { name: "Ghost" } });
        // if (!ghostType) throw new HumanError("ghostType does not exists");
        query.deletedAt = null;
        if (id) query._id = mongoose.Types.ObjectId(id);
        if (title) query.title = {$regex: ".*" + title + ".*"};
        if (competitionId) query = {"competitionId._id": mongoose.Types.ObjectId(competitionId)};
        if (diamondTypeId) query = {"diamondTypeId._id": mongoose.Types.ObjectId(diamondTypeId)};
        // else query.diamondTypeId = { [Op.ne]: ghostType._id };
        //categories filters
        // if (category_title) {
        // 	query = { "category.title": new RegExp(category_title, "i") };
        // }

        if (createdAt) {
            const {start, end} = dateQueryBuilder(createdAt);
            query.createdAt = {$gte: start, $lte: end};
        }

        //sort
        if (order == "DESC") {
            sort.createdAt = -1;
        } else if (order == "ASC") {
            sort.createdAt = +1;
        }

        if (searchQuery) {
            query["$or"] = [
                {
                    "competition.title": {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    "cardType.title": {
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

        const result = await Task.aggregate([
            {
                $lookup: {
                    from: "competitions",
                    localField: "competitionId",
                    foreignField: "_id",
                    as: "competitionId",
                },
            },
            {$unwind: {path: "$competitionId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "diamondTypes",
                    localField: "diamondTypeId",
                    foreignField: "_id",
                    as: "diamondTypeId",
                },
            },
            {$unwind: {path: "$diamondTypeId", preserveNullAndEmptyArrays: true}},
            {$sort: sort},
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

        // if (searchQuery) {
        //     query = {
        //         [Op.or]: [
        //             {"$competition.title$": {[Op.like]: "%" + searchQuery + "%"}},
        //             {"$cardType.title$": {[Op.like]: "%" + searchQuery + "%"}},
        //             //	{ "$cardTier.title$": { [Op.like]: "%" + searchQuery + "%" } },
        //             {
        //                 entranceFee: Task.sequelize.where(
        //                     Task.sequelize.cast(
        //                         Task.sequelize.col("entranceFee"),
        //                         "varchar",
        //                     ),
        //                     {[Op.iLike]: "%" + searchQuery + "%"},
        //                 ),
        //             },
        //         ],
        //     };
        // }

        // const count = await Task.countDocuments(query);
        // const items = await Task.find(query)
        // 	.select("-__v")
        // 	.populate({ path: "diamondTypeId" })
        // 	.populate({ path: "competitionId" })
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

/**
 * get one task
 */
async function getTask(id) {
    let result = await Task.findOne({
        _id: id,
        deletedAt: null,
    })
        .populate({path: "diamondTypeId"})
        .populate({path: "competitionId"});

    if (!result) throw new NotFoundError(Errors.TASK_NOT_FOUND.MESSAGE, Errors.TASK_NOT_FOUND.CODE, {id});

    return result;
}

function editTask(id, data, files) {
    return new Promise(async (resolve, reject) => {
        const {competitionId, diamondTypeId, title, description} = data;

        let result = await Task.findOne({_id: id, deletedAt: null});

        if (!result)
            return reject(new NotFoundError(Errors.TASK_NOT_FOUND.MESSAGE, Errors.TASK_NOT_FOUND.CODE, {id}));

        let image = {};

        if (files && Object.keys(files).length) {
            for (let key in files) {
                let file = files[key].shift();

                result.image = image[key] = [
                    {
                        name: file.newName,
                        key: file.key,
                        location: file.location,
                    },
                ];
            }
        }

        if (competitionId) result.competitionId = competitionId;
        if (diamondTypeId) result.diamondTypeId = diamondTypeId;
        if (title) result.title = title;
        if (description) result.description = description;

        await result.save();
        // if (!result.shift()) throw new NotFoundError("An error occurred while updating!", 400);

        return resolve("Successful");
    });
}

/**
 * delete Task
 */
function deleteTask(id) {
    return new Promise(async (resolve, reject) => {
        let result = await Task.findOneAndUpdate({_id: id, deletedAt: null}, {$set: {deletedAt: new Date()}});

        if (!result) return reject(new HumanError(Errors.TASK_NOT_FOUND.MESSAGE, Errors.TASK_NOT_FOUND.CODE, {id}));

        return resolve("Successful");
    });
}

// async function completeCompetitions(competition) {
//     let transaction = await sequelize.transaction();
//
//     try {
//         const cardTypes = await CardType.find({transaction});
//
//         let notifList = [];
//
//         for (let o = 0; o < cardTypes.length; o++) {
//             const diamondTypeId = cardTypes[o]._id;
//
//             let leaderboards = await MatchParticipantTeam.find({
//                 where: {
//                     competitionId: competition._id,
//                 },
//                 order: [["score", "DESC"]],
//                 include: [
//                     {
//                         model: User,
//                         attributes: ["name", "avatar", "id", "referredCode"],
//                     },
//                     {
//                         model: Card,
//                         where: {diamondTypeId: diamondTypeId},
//                         required: true,
//                     },
//                 ],
//                 transaction,
//             });
//
//             let prizes = await Prize.find({
//                 where: {diamondTypeId: diamondTypeId},
//                 transaction,
//             });
//
//             for (let j = 0; j < leaderboards.length; j++) {
//                 const rank = j + 1;
//                 const user = leaderboards[j].user;
//                 const score = leaderboards[j].score;
//                 const diamondId = leaderboards[j].diamondId;
//                 const lenses = leaderboards[j].lenses;
//
//                 if (!user) continue;
//
//                 //if user competition score greate than 7
//                 if (score >= 7) {
//                     await increaseLevelAttribute(0.1, user._id, diamondId, diamondTypeId, transaction);
//                 } else if (score < 5) {
//                     await increaseLevelAttribute(-0.05, user._id, diamondId, diamondTypeId, transaction);
//                 }
//
//                 // increase level attribute
//                 if (lenses && lenses.length > 0) {
//                     console.log("calculating lens", lenses);
//
//                     await calculateLenses(user._id, diamondId, diamondTypeId, lenses, transaction);
//                 }
//
//                 for (let k = 0; k < prizes.length; k++) {
//                     const prize = prizes[k];
//
//                     if (sliceWinners(prize.tier, rank)) {
//                         //found prize of this rank
//                         // if (user.referredCode) {
//                         //
//                         //     const amount = prize.amount;
//                         //
//                         //     const ReferralRewardOne = await RefferalReward(parseFloat(amount) * 3 / 100, user.referredCode, user, prize.assetId, transaction)
//                         //     prize.amount = parseFloat(prize.amount) - parseFloat(amount) * 3 / 100;
//                         //
//                         //     if (ReferralRewardOne) {
//                         //         const ReferralRewardTwo = await RefferalReward(parseFloat(amount) * 2 / 100, ReferralRewardOne, user, prize.assetId, transaction)
//                         //         prize.amount = parseFloat(prize.amount) - parseFloat(amount) * 2 / 100;
//                         //
//                         //         if (ReferralRewardTwo) {
//                         //             await RefferalReward(parseFloat(amount) * 1.5 / 100, ReferralRewardTwo, user, prize.assetId, transaction)
//                         //             prize.amount = parseFloat(prize.amount) - parseFloat(amount) * 1.5 / 100;
//                         //         }
//                         //     }
//                         //
//                         // }
//                         // prize.amount = parseFloat(prize.amount.toFixed(2));
//
//                         let systemWallet = await SystemWallet.findOne({
//                             where: {assetId: prize.assetId},
//                             transaction,
//                         });
//
//                         let userWallet = await UserWallet.findOne({
//                             where: {userId: user._id, assetId: prize.assetId},
//                             transaction,
//                         });
//
//                         if (!userWallet) {
//                             userWallet = await UserWallet.create(
//                                 {
//                                     where: {userId: user._id, assetId: prize.assetId},
//                                 },
//                                 {transaction, returning: true},
//                             );
//                         }
//
//                         await systemWallet.decrement("amount", {by: +prize.amount, transaction});
//
//                         await userWallet.increment("amount", {by: +prize.amount, transaction});
//
//                         await UserPrize.create(
//                             {
//                                 userId: user._id,
//                                 tier: rank,
//                                 diamondTypeId: diamondTypeId,
//                                 competitionId: competition._id,
//                                 assetId: prize.assetId,
//                                 amount: prize.amount,
//                             },
//                             {
//                                 transaction,
//                             },
//                         );
//                         const card = await Card.findOne({where: {id: diamondId}});
//                         const cardType = await CardType.findOne({where: {id: diamondTypeId}});
//
//                         notifList.push({
//                             userId: user._id,
//                             rank: rank,
//                             score: score,
//                             prize: prize.amount,
//                             competition_name: competition.title,
//                             card_name: card.name,
//                             cardType_name: cardType.name,
//                         });
//
//                         break;
//                     }
//                 }
//             }
//         }
//
//         await transaction.commit();
//
//         // send ranking notif to user
//         if (notifList.length > 0) {
//             for (const item of notifList) {
//                 // send notif to user
//                 await UserNotification.create({
//                     userId: item.userId,
//                     title: `Reward`,
//                     description: `You became rank ${item.rank} with ${item.card_name} ${item.cardType_name} camera in ${item.competition_name} and earned ${item.prize} STL`,
//                 });
//
//                 const user = await User.findOne({where: {id: item.userId}});
//
//                 sendPushToToken(
//                     user,
//                     {},
//                     {
//                         title: "Reward",
//                         body: `You became rank ${item.rank} with ${item.card_name} ${item.cardType_name} camera in ${item.competition_name} and earned ${item.prize} STL`,
//                     },
//                 );
//             }
//         }
//     } catch (e) {
//         await transaction.rollback();
//         throw e;
//     }
// }

//slice Winners
function sliceWinners(tier, number) {
    let from, to;

    [from, to] = tier.split("-");

    if (parseInt(from) === parseInt(number)) return true;

    return parseInt(number) > parseInt(from) && parseInt(number) <= parseInt(to);
}

function getCompetitionByUser(id, user) {
    return new Promise(async (resolve, reject) => {
        const competition = await Competition.findOne({deletedAt: null, _id: id}).lean();
        if (!competition)
            return reject(
                new NotFoundError(Errors.COMPETITION_NOT_FOUND.MESSAGE, Errors.COMPETITION_NOT_FOUND.CODE, {id}),
            );

        if (user) {
            const collections = await UserCollection.countDocuments({user: user._id, deletedAt: null});
            if (collections === 0) {
                const category = await Category.findOne({title: "Art"});
                await UserCollection.create({
                    user: user._id,
                    name: "competition_" + user.address.slice(-4),
                    description: "this is a collection for competition's task",
                    category: category._id,
                    image: [
                        {
                            name: "abe27f8c-3dad-4fb6-8115-4b4224d0df6d.png",
                            key: "collection/images/abe27f8c-3dad-4fb6-8115-4b4224d0df6d.png",
                            location:
                                "https://ftvio.s3.amazonaws.com/collection/images/abe27f8c-3dad-4fb6-8115-4b4224d0df6d.png",
                        },
                    ],
                    featured: [
                        {
                            name: "c6e91048-0f41-4dd7-ba7d-b66ad6caf134.blob",
                            key: "collection/images/c6e91048-0f41-4dd7-ba7d-b66ad6caf134.blob",
                            location:
                                "https://ftvio.s3.amazonaws.com/collection/images/abe27f8c-3dad-4fb6-8115-4b4224d0df6d.png",
                        },
                    ],
                });
            }
        }

        // if (competition.status !== 'OPEN')
        //     return reject(new HumanError(Errors.COMPETITION_NOT_OPEN.MESSAGE, Errors.COMPETITION_NOT_OPEN.CODE, {id}));

        const diamondTypes = await DiamondType.find({deletedAt: null}).sort({price: "ASC"}).lean();

        for (let i = 0; i < diamondTypes.length; i++) {
            let diamonds = await UserDiamond.find({
                deletedAt: null,
                userId: user._id,
            })
                .populate({path: "diamondId", match: {diamondTypeId: diamondTypes[i]._id, deletedAt: null}})
                .lean();

            const tasks = await Task.find({
                competitionId: competition._id,
                diamondTypeId: diamondTypes[i]._id,
                deletedAt: null,
            });

            diamonds = diamonds.filter((diamond) => {
                return diamond.diamondId !== null;
            });

            diamondTypes[i]["userDiamond"] = diamonds;

            for (let x = 0; x < diamonds.length; x++) {
                diamondTypes[i].userDiamond[x].diamondId.task_count = tasks.length;

                diamondTypes[i].userDiamond[x].diamondId.participate_count = await UserTask.countDocuments({
                    deletedAt: null,
                    userId: user._id,
                    diamondId: diamondTypes[i].userDiamond[x].diamondId._id,
                    competitionId: competition._id,
                });
            }
        }

        return resolve({
            competition: competition,
            diamondType: diamondTypes,
        });
    });
}

function getTasksByUser(data, user) {
    return new Promise(async (resolve, reject) => {
        const {competitionId, diamondTypeId, diamondId} = data;

        const items = await Task.find({
            deletedAt: null,
            competitionId: competitionId,
            diamondTypeId: diamondTypeId,
        })
            .populate({path: "diamondTypeId"})
            .lean();

        for (let i = 0; i < items.length; i++) {
            const userTask = await UserTask.findOne({
                deletedAt: null,
                userId: user._id,
                diamondId: diamondId,
                taskId: items[i]._id,
            });

            items[i].isParticipate = false;

            if (userTask) items[i].isParticipate = true;
        }

        if (!items) return reject(new NotFoundError(Errors.TASK_NOT_FOUND.MESSAGE, Errors.TASK_NOT_FOUND.CODE));

        return resolve(items);
    });
}

function participateTask(tokenId, data, user) {
    return new Promise(async (resolve, reject) => {
        const {diamondId, taskId} = data;
        const token = await UserToken.findOne({_id: tokenId, deletedAt: null});
        const task = await Task.findOne({_id: taskId, deletedAt: null});
        const diamond = await Diamond.findOne({_id: diamondId, deletedAt: null});

        if (!task) return reject(new NotFoundError(Errors.TASK_NOT_FOUND.MESSAGE, Errors.TASK_NOT_FOUND.CODE));

        if (!diamond) return reject(new HumanError(Errors.DIAMOND_NOT_FOUND.MESSAGE, Errors.DIAMOND_NOT_FOUND.CODE));

        if (!token)
            return reject(new HumanError(Errors.USER_TOKEN_NOT_FOUND.MESSAGE, Errors.USER_TOKEN_NOT_FOUND.CODE));

        if (diamond.diamondTypeId.toString() != task.diamondTypeId.toString())
            return reject(new HumanError("you can not participate in this task with this diamond", 400));

        // if (token.userId !== user._id)
        //     return reject(new HumanError('this token is not yours', 400));`

        await UserTask.create({
            userId: user._id,
            diamondId: diamondId,
            taskId: taskId,
            tokenId: tokenId,
            status: "OPEN",
            competitionId: task.competitionId,
        });

        let team = await MatchParticipantTeam.findOne({
            userId: user._id,
            competitionId: task.competitionId,
            diamondId: diamondId,
        });

        if (!team) {
            team = await MatchParticipantTeam.create({
                userId: user._id,
                competitionId: task.competitionId,
                diamondTypeId: task.diamondTypeId,
                diamondId: diamondId,
            });
        }

        let isExist = await MatchParticipant.findOne({participantTeamId: team._id, taskId: taskId});

        if (isExist) throw new HumanError("You uploaded an image for this task before.", 400);

        await MatchParticipant.create({
            userId: user._id,
            participantTeamId: team._id,
            taskId: taskId,
            competitionId: task.competitionId,
            tokenId: token._id,
        });

        return resolve("success");
    });
}

async function getMatchParticipant(data) {
    // return new Promise(async (resolve, reject) => {
    const {
        page,
        limit,
        order,
        id,
        userId,
        competitionId,
        matchParticipantTeam,
        username,
        status,
        position,
        createdAt,
        searchQuery,
        score,
        competitionTitle,
    } = data;
    return new Promise(async (resolve, reject) => {
        let query = {};
        // let finalOrder = [[sort, order]];

        if (id) query._id = mongoose.Types.ObjectId(id);
        // if (diamondTypeId) query.diamondTypeId = {$in: diamondTypeId};
        if (status) query.status = {$in: [...status]};
        if (score) query.score = new RegExp(score, "i");
        if (competitionId) query.competitionId = mongoose.Types.ObjectId(competitionId);
        if (username) {
            query = {"userId.username": new RegExp(username, "i")};
        }
        if (competitionTitle) {
            query = {"competitionId.title": new RegExp(competitionTitle, "i")};
        }

        //sort
        let sort = {};
        if (order == "DESC") {
            sort.createdAt = -1;
        } else if (order == "ASC") {
            sort.createdAt = +1;
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
                    "taskId.title": {
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

        const result = await MatchParticipant.aggregate([
            {
                $lookup: {
                    from: "userTokens",
                    localField: "tokenId",
                    foreignField: "_id",
                    as: "tokenId",
                },
            },
            {$unwind: {path: "$tokenId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "tasks",
                    localField: "taskId",
                    foreignField: "_id",
                    as: "taskId",
                },
            },
            {$unwind: {path: "$taskId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "competitions",
                    localField: "competitionId",
                    foreignField: "_id",
                    as: "taskId.competitionId",
                },
            },
            {$unwind: {path: "$taskId.competitionId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "competitions",
                    localField: "competitionId",
                    foreignField: "_id",
                    as: "competitionId",
                },
            },
            {$unwind: {path: "$competitionId", preserveNullAndEmptyArrays: true}},
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
            {$sort: sort},
            {$project: {categoryTitle: 0}},
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

        // if (matchParticipantTeam)
        //     query["$matchParticipantTeam.competitionLeague.title$"] = {
        //         [postgres.Op.iLike]: `%${matchParticipantTeam}%`
        //     };
        //
        // if (user) {
        //     query[postgres.Op.or] = [
        //         {"$matchParticipantTeam.user.name$": {[postgres.Op.iLike]: `%${user}%`}},
        //         {"$matchParticipantTeam.user.email$": {[postgres.Op.iLike]: `%${user}%`}}
        //     ];
        // }
        // if (status) query.status = {[postgres.Op.in]: status};
        // if (position) query.position = {[postgres.Op.in]: position};
        //
        // if (userId) query["$matchParticipantTeam.userId$"] = userId;
        // if (competitionId) query["$matchParticipantTeam.competitionLeague.competitionId$"] = competitionId;
        //
        //
        // if (competitionName) query["$competition.title$"] = {[postgres.Op.iLike]: "%" + competitionName + "%"};
        //
        // if (searchQuery) {
        //     query[postgres.Op.or] = [
        //         {"$matchParticipantTeam.user.name$": {[postgres.Op.iLike]: `%${searchQuery}%`}},
        //         {"$matchParticipantTeam.competitionLeague.title$": {[postgres.Op.iLike]: `%${searchQuery}%`}}
        //     ];
        // }
        //
        // if (createdAt) {
        //     const {start, end} = dateQueryBuilder(createdAt);
        //     query.createdAt = {[postgres.Op.gte]: start, [postgres.Op.lte]: end};
        // }
        //
        // if (score) {
        //     query.score = postgres.sequelize.where(
        //         postgres.sequelize.cast(postgres.sequelize.col("matchParticipant.score"), "varchar"),
        //         {[postgres.Op.eq]: score}
        //     );
        // }

        // const count = await MatchParticipant.countDocuments(query);

        // const items = await MatchParticipant.find(query)
        // 	.select("-__v")
        // 	.sort({ [sort]: order })
        // 	.skip((page - 1) * limit)
        // 	.limit(limit)
        // 	.populate([
        // 		{ path: "tokenId" },
        // 		{ path: "userId" },
        // 		{ path: "taskId", populate: { path: "competitionId" } },
        // 	])
        // 	.lean();

        // resolve({
        // 	total: count ?? 0,
        // 	pageSize: limit,
        // 	page,
        // 	data: items,
        // });
    });
}

async function updateMatchParticipant(match_participant_id, score, status, io) {
    return new Promise(async (resolve, reject) => {
        const participant = await MatchParticipant.findOne({_id: match_participant_id}).populate({
            path: "competitionId",
        });
        if (!participant) return reject(new HumanError("Match Participant not found!", 404));

        if (participant.status !== "OPEN") return reject(new HumanError("This Match Participant is not open!", 400));

        const team = await MatchParticipantTeam.findOne({_id: participant.participantTeamId});

        const card = await Diamond.findOne({_id: team.diamondId});
        const cardType = await DiamondType.findOne({_id: card.diamondTypeId});
        const {userId} = team;

        // await participant.update({score, status}, {transaction});

        participant.score = score;
        participant.status = "CLOSE";
        await participant.save();

        team.score += parseFloat(score);
        team.save();
        // send notif to user
        const notif = await UserNotification.create({
            userId,
            title: `Score`,
            description: `You have earned ${score} points with ${card.name} ${cardType.name} diamond`,
        });

        if (io) io.to(`UserId:${userId}`).emit("notification", JSON.stringify(notif));

        // const user = await postgres.User.findOne({where: {id: userId}, transaction});
        //
        // await transaction.commit();
        //
        // sendPushToToken(user, {}, {
        //     title: "Score",
        //     body: `You have earned ${score} points with ${card.name} ${cardType.name} camera in ${participant.competition.title}`
        // });

        return resolve("Successful");
    });
}

function getPrizeCompetition(diamondTypeId) {
    return new Promise(async (resolve, reject) => {
        let prizes = await Prize.find({diamondTypeId: diamondTypeId, deletedAt: null})
            .populate({path: "diamondTypeId"})
            .populate({path: "assetId"})
            .sort({amount: "DESC"});
        return resolve(prizes);
    });
}

async function getLeaderboards(diamondTypeId, competitionId, limit, page) {
    return new Promise(async (resolve, reject) => {
        let leaders = await MatchParticipantTeam.find({
            competitionId: competitionId,
            diamondTypeId: diamondTypeId,
            deletedAt: null,
        })
            .populate({path: "userId"})
            .populate({path: "diamondId"})
            .populate({path: "diamondTypeId"})
            .sort({score: "DESC"})
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        resolve({
            total: leaders.length ?? 0,
            pageSize: limit,
            page,
            data: leaders,
        });
    });
}

async function getScoreMatchParticipant(id, data) {
    return new Promise(async (resolve, reject) => {
        const {limit, page} = data;
        let query = {participantTeamId: id, deletedAt: null};
        const count = await MatchParticipant.countDocuments(query);
        let result = await MatchParticipant.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .populate({path: "userId"})
            .populate({path: "tokenId"})
            .populate({path: "taskId"})
            .lean();

        if (!result)
            throw new NotFoundError(
                Errors.MATCH_PARTICIPENT_NOT_FOUND.MESSAGE,
                Errors.MATCH_PARTICIPENT_NOT_FOUND.CODE,
                {
                    id,
                },
            );

        resolve({
            total: count ?? 0,
            pageSize: limit,
            page,
            data: result,
        });
    });
}

module.exports = {
    participateTask,
    getTasksByUser,
    getCompetitionByUser,
    deleteTask,
    editTask,
    getTask,
    getTasks,
    addTask,
    deleteCompetition,
    editCompetition,
    addCompetition,
    getCompetition,
    getCompetitions,
    updateMatchParticipant,
    getMatchParticipant,
    getPrizeCompetition,
    getLeaderboards,
    getScoreMatchParticipant,
    countCompetitionParticipant,
    competitionRank,
    sliceWinners
};

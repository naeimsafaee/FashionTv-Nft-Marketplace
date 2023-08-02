const {NotFoundError, HumanError, ConflictError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {ManagerNotification, UserNotification, Competition, User, UserWallet} = require("../../databases/mongodb");
const uuid = require("uuid");

function getNotifications(data) {
    return new Promise(async (resolve, reject) => {
        let {page, limit, order} = data;

        const query = {deletedAt: null, read: false};

        const count = await ManagerNotification.countDocuments(query);
        const items = await ManagerNotification.find(query)
            .populate({
                path: "body.auction",
                match: {deletedAt: null},
            })
            .populate({
                path: "body.collection",
                match: {deletedAt: null},
            })
            .select("-__v")
            .sort({createdAt: order})
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

function readAllManagerNotifications() {
    return new Promise(async (resolve, reject) => {
        const query = {deletedAt: null};

        await ManagerNotification.updateMany(query, {$set: {read: true}});

        resolve({});
    });
}

function readOneManagerNotification(id) {
    return new Promise(async (resolve, reject) => {
        const query = {deletedAt: null, read: false, _id: id};

        await ManagerNotification.updateOne(query, {$set: {read: true}});

        resolve({});
    });
}


function get(type, page = 1, limit = 10, status, userId = null) {
    return new Promise(async (resolve, reject) => {
        let query = {}
        let count
        let result;
        if (typeof status !== 'undefined') {
            count = await UserNotification.countDocuments({
                status: status,
                userId: userId,
                deletedAt: null
            });
            result = await UserNotification.find({status: status, userId: userId, deletedAt: null})
                .select("-__v")
                .sort({createdAt: 'DESC'})
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        } else {
            count = await UserNotification.countDocuments({
                userId: userId,
                deletedAt: null
            });
            result = await UserNotification.find({userId: userId, deletedAt: null})
                .select("-__v")
                .sort({createdAt: 'DESC'})
                .skip((page - 1) * limit)
                .limit(limit)
                .lean();
        }


        resolve({
            total: count,
            pageSize: limit,
            page,
            data: result
        });
    });
}

// function updateToken(token, userId) {
//     return new Promise(async (resolve, reject) => {
//         await postgres.User.update({
//             pushToken: token
//         }, {
//             where: {
//                 id: userId
//             }
//         });
//
//         return resolve({
//             message: "ok"
//         });
//     });
// }


function changeStatus(userId, notification_id, model = "UserNotification") {
    return new Promise(async (resolve, reject) => {
        let query = {};
        query.userId = userId
        query.deletedAt = null

        model = model === "UserNotification" ? UserNotification : ManagerNotification;

        if (notification_id) {
            query._id = notification_id;
            await model.findOneAndUpdate(
                query,
                {$set: {status: true}},
            );
        } else {
            await model.updateMany(
                query,
                {$set: {status: true}},
            );
        }

        return resolve("Successful");
    });
}


async function readAllNotification(userId, notification_id, model = "UserNotification") {

    return new Promise(async (resolve, reject) => {

        let query = {userId};

        if (notification_id)
            query.id = notification_id;

        model = model === "UserNotification" ? postgres.UserNotification : postgres.ManagerNotification;

        await model.update({status: true}, {where: query});

        return resolve("Successful");
    });
}

async function readNotification(userId, notification_id) {

    for (let i = 0; i < notification_id.length; i++) {

        await UserNotification.findOneAndUpdate(
            {_id: notification_id, deletedAt: null},
            {$set: {deletedAt: new Date()}},
        );
    }

    return ("Successful");
}


async function sendUserNotif(userId, title, description, io) {

    let notif = await UserNotification.create({
            userId: userId,
            title: title,
            description: description,
        }
    );
    const userWallet = await UserWallet.find({userId: userId}).lean()

    if (io) {
        io.to(`UserId:${userId}`).emit("notification", JSON.stringify(notif));
        io.to(`UserId:${userId}`).emit("wallet", JSON.stringify(userWallet));

    }


    return ("Successful");
}

async function test() {
    const users = await User.find({})

    for (let i = 0; i < users.length; i++) {
        users[i].levelId = null
        users[i].referralCode = uuid.v4()?.split("-")?.shift();
        users[i].seenReferredModal = false;
        users[i].save()
    }
    return 'ok'
}

module.exports = {
    getNotifications,
    readAllManagerNotifications,
    readOneManagerNotification,
    get,
    // updateToken,
    changeStatus,
    readNotification,
    readAllNotification,
    sendUserNotif,
    test
};

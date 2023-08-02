const {
    httpResponse: {response, apiError},
    httpStatus,
} = require("./../../utils");
const {userService, notificationService} = require("../services");

exports.addUsers = async (req, res) => {
    try {
        const data = await userService.addUsers(req.body, req.files, req.fileValidationError);
        return response({res, statusCode: httpStatus.CREATED, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.editUsers = async (req, res) => {
    try {
        const data = await userService.editUsers(req.body, req.files, req.userEntity, req.fileValidationError);
        return response({res, statusCode: httpStatus.ACCEPTED, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.editUsersByManager = async (req, res) => {
    try {
        const data = await userService.editUsersByManager(req.body, req.files, req.fileValidationError);
        return response({res, statusCode: httpStatus.ACCEPTED, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.deleteUsers = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await userService.deleteUsers(id);
        return response({res, statusCode: httpStatus.ACCEPTED, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.findUserById = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await userService.findUserById(id);
        return response({res, statusCode: httpStatus.ACCEPTED, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.inviteLinkHandler = async (req, res) => {
    try {
        const {code} = req.params;
        const data = await userService.inviteLinkHandler(res, code);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        // console.log(e);
        return res.status(e.statusCode).json(e);
    }
};
exports.getUser = async (req, res) => {
    try {
        const {id} = req.params;
        const {requestedUserId} = req.query;
        const data = await userService.getUser(id, requestedUserId);
        return response({res, statusCode: httpStatus.ACCEPTED, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.getUsers = async (req, res) => {
    try {
        const data = await userService.getUsers(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.getUsersSelector = async (req, res) => {
    const data = await userService.getUsersSelector(req.query);
    return response({res, statusCode: httpStatus.OK, data});

};

// exports.searchUsers = async (req, res) => {
// 	const data = await userService.getUsers(req.body);
// 	return response({ res, statusCode: httpStatus.OK, data });
// };

exports.approveNft = async (req, res) => {
    try {
        const data = await userService.approveNft(req.userEntity);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.tabsInfo = async (req, res) => {
    try {
        const data = await userService.tabsInfo(req.query, req.userEntity);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.notification = async (req, res) => {
    try {
        const {type, page, limit, status} = req.query;

        const data = await notificationService.get(type, page, limit, status, req.userEntity?._id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        if (!e.statusCode) e = {statusCode: 500, status: "Internal Error", message: e.message};
        return res.status(e.statusCode).json(e);
    }
};

// exports.updateNotification = async (req, res) => {
// 	try {
// 		const { fcm_token } = req.body;
//
// 		const data = await notificationService.updateToken(fcm_token, Number(req.userEntity?.id));
// 		return response({ res, statusCode: httpStatus.OK, data });
// 	} catch (e) {
// 		return res.status(400).json(e);
// 	}
// };

exports.notificationStatus = async (req, res) => {
    const {notification_id} = req.params;
    const data = await notificationService.changeStatus(req.userEntity._id, notification_id);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.readAllNotification = async (req, res) => {
    const data = await notificationService.readAllNotification(req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.readNotification = async (req, res) => {
    const {notification_id} = req.body;
    const data = await notificationService.readNotification(Number(req.userEntity?.id), notification_id);
    return response({res, statusCode: httpStatus.OK, data});
};

exports.sendUserNotif = async (req, res) => {
    const io = req.app.get("socketIo");
    const {userId, title, description} = req.body;
    const data = await notificationService.sendUserNotif(userId, title, description, io);
    return response({res, statusCode: httpStatus.OK, data});
};

exports.test = async (req, res) => {
    const data = await notificationService.test();
    return response({res, statusCode: httpStatus.OK, data});
};

exports.referral = async (req, res) => {
    const data = await userService.referral(req.userEntity);
    return response({res, statusCode: httpStatus.ACCEPTED, data});
};
exports.referralHistory = async (req, res) => {
    const data = await userService.referralHistory(req.query, req.userEntity);
    return response({res, statusCode: httpStatus.ACCEPTED, data});
};
const {
    httpResponse: {response, apiError},
    httpStatus,
} = require("../../utils");
const {serializeUser, getUserWallet, serializeManger} = require("../../utils/serializer/user.serializer");
const {authService} = require("../services");

exports.managerLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        const data = await authService.managerLogin(email, password);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};
exports.userRegister = async (req, res) => {
    try {
        const io = req.app.get("socketIo");

        const data = await authService.userRegister(req, io);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        if (!e.statusCode) return res.status(500).json(e);
        return res.status(e.statusCode).json(e);
    }
};

exports.addReferredCode = async (req, res) => {
    const data = await authService.addReferredCode(req.userEntity._id, req.body);
    return response({res, statusCode: httpStatus.OK, data});
};

exports.seenGhostModal = async (req, res) => {
    const data = await authService.seenGhostModal(req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});
};

exports.getUserInfo = async (req, res) => {
    const data = await serializeUser(req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getManagerInfo = async (req, res) => {
    try {
        const data = await authService.managerInfo(req.userEntity._id);

        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        if (!e.statusCode) return res.status(500).json(e);

        return res.status(e.statusCode).json(e);
    }
};
exports.getUserWallet = async (req, res) => {
    try {
        const data = await getUserWallet(req.userEntity);

        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        if (!e.statusCode) e.statusCode = 500;
        return res.status(e.statusCode).json(e);
    }
};

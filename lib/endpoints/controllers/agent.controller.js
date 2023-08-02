const {httpResponse: {response, apiError}, httpStatus,} = require("../../utils");
const {agentService} = require("./../services");

/**
 * manager login
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.login = async (req, res) => {
    const {mobile, email, password} = req.body;
    const data = await agentService.login(mobile, email, password);
    return response({res, statusCode: httpStatus.OK, data});

};

/**
 * logout agents
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.logout = async (req, res) => {
    try {
        const data = await agentService.logout(req.sessionEntity);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * get agent info
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.info = async (req, res) => {
    try {
        const data = await agentService.info(req.userEntity.id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * get agent allet
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.wallet = async (req, res) => {
    try {
        const data = await agentService.wallet(req.userEntity.id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.statistics = async (req, res) => {
    try {
        let {page, limit} = req.query;
        const data = await agentService.statistics(req.userEntity.id, page, limit);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.statisticDetails = async (req, res) => {
    try {
        let {page, limit, userId} = req.query;
        const data = await agentService.statisticDetails(req.userEntity.id, userId, page, limit);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.getFees = async (req, res) => {
    try {
        const data = await agentService.getFees(req.userEntity);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

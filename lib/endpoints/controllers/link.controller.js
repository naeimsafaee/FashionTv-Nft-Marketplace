const {
    httpResponse: {response},
    httpStatus,
} = require("../../utils");
const {linkService} = require("./../services");

exports.createLink = async (req, res) => {
    const data = await linkService.createLink(req.body, req.userEntity);
    return response({res, statusCode: httpStatus.CREATED, data});

};

exports.editLink = async (req, res) => {
    const data = await linkService.editLink(req.body, req.userEntity);
    return response({res, statusCode: httpStatus.ACCEPTED, data});

};

exports.deleteLink = async (req, res) => {
    const data = await linkService.deleteLink(req.params, req.userEntity);
    return response({res, statusCode: httpStatus.ACCEPTED, data});

};

exports.getLinkByManager = async (req, res) => {
    const data = await linkService.getLinkByManager(req.params);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getLinksByManager = async (req, res) => {
    const data = await linkService.getLinksByManager(req.query);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getLink = async (req, res) => {
    const data = await linkService.getLink(req.params, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getLinks = async (req, res) => {
    const data = await linkService.getLinks(req.query, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getStatistics = async (req, res) => {
    const data = await linkService.getStatistics(req.query, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getLinkStatistics = async (req, res) => {
    const {id} = req.params;
    const data = await linkService.getLinkStatistics(id, req.query, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getCommissionsChart = async (req, res) => {
    const data = await linkService.getCommissionsChart(req.query, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getRegisterChart = async (req, res) => {
    const data = await linkService.getRegisterChart(req.query, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});
};

exports.getClickChart = async (req, res) => {
    const data = await linkService.getClickChart(req.query, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.directReferral = async (req, res) => {
    const data = await linkService.directReferral(req.query, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});
};

exports.totals = async (req, res) => {
    const data = await linkService.totals(req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.clientCommission = async (req, res) => {
    const data = await linkService.clientCommission(req.query, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

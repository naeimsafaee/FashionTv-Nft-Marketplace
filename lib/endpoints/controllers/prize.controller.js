const {httpResponse: {response}, httpStatus,} = require("../../utils");
const {prizeService} = require("../services");

exports.getPrize = async (req, res) => {
    try {
        const data = await prizeService.getPrize(req.params.id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.deletePrize = async (req, res) => {
    try {
        const data = await prizeService.deletePrize(req.params.id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.editPrize = async (req, res) => {
    try {
        const data = await prizeService.editPrize(req.params.id, req.body);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.addPrize = async (req, res) => {
    try {
        const data = await prizeService.addPrize(req.body);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.getPrizes = async (req, res) => {
    try {
        const data = await prizeService.getPrizes(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};
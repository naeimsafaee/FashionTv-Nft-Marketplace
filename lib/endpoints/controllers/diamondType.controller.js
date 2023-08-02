const {diamondTypeService, diamondService} = require("../services");
const {httpStatus, httpResponse: {response}} = require("../../utils");


exports.addDiamondType = async (req, res) => {
    try {
        const data = await diamondTypeService.addDiamondType(req.body, req.files);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }

};

exports.editDiamondType = async (req, res) => {
    try {
        const data = await diamondTypeService.editDiamondType(req.params.id, req.body, req.files);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }

};

exports.deleteDiamondType = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await diamondTypeService.deleteDiamondType(id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }

};

exports.getDiamondType = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await diamondTypeService.getDiamondType(id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.getDiamondTypes = async (req, res) => {
    try {
        const data = await diamondTypeService.getDiamondTypes(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.getDiamondTypeByManager = async (req, res) => {

    const {id} = req.params;
    const data = await diamondTypeService.getDiamondType(id);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.getDiamondTypesByManager = async (req, res) => {
    const data = await diamondTypeService.getDiamondTypes(req.query);
    return response({res, statusCode: httpStatus.OK, data});

};

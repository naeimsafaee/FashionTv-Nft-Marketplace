const {HumanError} = require("../services/errorhandler");
const {
    httpResponse: {response},
    httpStatus,
} = require("./../../utils");
// const {fee} = require("../../../../services/swap.service");

const {swapServices} = require("./../services");
const {transferCrypto} = require("../services/financial.service");
const {Asset} = require("../../databases/mongodb");

exports.index = async (req, res) => {
    const data = await swapServices.index(req.body, req.userEntity);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.add = async (req, res) => {
    const io = req.app.get("socketIo");

    const data = await swapServices.add(req.body, req.userEntity , io);
    return response({res, statusCode: httpStatus.OK, data});

};

exports.get = async (req, res) => {
    const data = await swapServices.get(req.body);
    return response({res, statusCode: httpStatus.OK, data});

};
exports.getAllSwapTransactionByManager = async (req, res) => {
    const data = await swapServices.getAllSwapTransactionByManager(req.query);
    return response({res, statusCode: httpStatus.OK, data});

};

// exports.getSwapTransactionByManager = async (req, res) => {
// 	try {
// 		const { id } = req.params;
// 		const data = await swapServices.getSwapTransactionByManager(id);

// 		return response({ res, statusCode: httpStatus.OK, data });
// 	} catch (e) {
// 		return res.status(e.statusCode).json(e);
// 	}
// };

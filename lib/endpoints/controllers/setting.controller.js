const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { settingService } = require("../services");

exports.addSetting = async (req, res) => {
	try {
		const data = await settingService.addSetting(req.body);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.editSetting = async (req, res) => {
	try {
		const data = await settingService.editSetting(req.body);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get fee by type and chain
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getSetting = async (req, res) => {
	try {
		const { type, chain } = req.query;
		const data = await settingService.getSetting(type, chain);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getSettings = async (req, res) => {
	try {
		const data = await settingService.getSettings(req.query);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

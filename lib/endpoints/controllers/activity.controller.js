const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { activityService } = require("../services");

exports.getOneActivityByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await activityService.getOneActivityByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllActivityByManager = async (req, res) => {
	try {
		const data = await activityService.getAllActivityByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.activitySelectorByManager = async (req, res) => {
	try {
		const data = await activityService.activitySelectorByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getPriceHistory = async (req, res) => {
	try {
		const data = await activityService.getPriceHistory(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { userFollowService } = require("../services");

exports.getOneUserFollowByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await userFollowService.getOneUserFollowByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllUserFollowByManager = async (req, res) => {
	try {
		const data = await userFollowService.getAllUserFollowByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.userFollowSelectorByManager = async (req, res) => {
	try {
		const data = await userFollowService.userFollowSelectorByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

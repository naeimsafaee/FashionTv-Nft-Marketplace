const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { assignedTokenService } = require("../services");

exports.getOneAssignedTokenByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await assignedTokenService.getOneAssignedTokenByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllAssignedTokenByManager = async (req, res) => {
	try {
		const data = await assignedTokenService.getAllAssignedTokenByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.assignedTokenSelectorByManager = async (req, res) => {
	try {
		const data = await assignedTokenService.assignedTokenSelectorByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

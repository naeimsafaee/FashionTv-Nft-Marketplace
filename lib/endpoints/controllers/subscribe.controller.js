const {
	httpResponse: { response },
	httpStatus,
} = require("../../utils");
const { subscribeService } = require("../services");

exports.addSubscribe = async (req, res) => {
	try {
		const { email } = req.body;
		const data = await subscribeService.addSubscribe(email);
		return response({ res, statusCode: httpStatus.CREATED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.deleteSubscribe = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await subscribeService.deleteSubscribe(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getOneSubscribe = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await subscribeService.getOneSubscribe(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllSubscribe = async (req, res) => {
	try {
		const data = await subscribeService.getAllSubscribe(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

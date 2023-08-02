const {
	httpResponse: { response },
	httpStatus,
} = require("../../utils");
const { contactUsService } = require("../services");

exports.addContactUs = async (req, res) => {
	try {
		const { title, description, email } = req.body;
		const data = await contactUsService.addContactUs(title, description, email);
		return response({ res, statusCode: httpStatus.CREATED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.deleteContactUs = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await contactUsService.deleteContactUs(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getOneContactUs = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await contactUsService.getOneContactUs(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllContactUs = async (req, res) => {
	try {
		const data = await contactUsService.getAllContactUs(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

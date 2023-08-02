const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("./../../utils");

const { notificationService } = require("../services");

exports.getAllManagerNotifications = async (req, res) => {
	try {
		const data = await notificationService.getNotifications(req.query);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.readAllManagerNotifications = async (req, res) => {
	try {
		const data = await notificationService.readAllManagerNotifications();
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.readOneManagerNotification = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await notificationService.readOneManagerNotification(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

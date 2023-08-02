const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { eventService } = require("../services");

exports.getEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const { specificCode } = req.query;
		const data = await eventService.getEvent(id, specificCode);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getEvents = async (req, res) => {
	try {
		const data = await eventService.getEvents(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.editEvent = async (req, res) => {
	try {
		const { id } = req.params;
		const { specificCode } = req.query;
		const data = await eventService.editEvent(id, specificCode, req.files);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.uploadEventPictures = async (req, res) => {
	try {
		const data = await eventService.uploadEventPictures(req.files);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getEventSingle = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await eventService.getEventSingle(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getEventAll = async (req, res) => {
	try {
		const { code } = req.params;
		const data = await eventService.getEventsAll(req.query, code);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

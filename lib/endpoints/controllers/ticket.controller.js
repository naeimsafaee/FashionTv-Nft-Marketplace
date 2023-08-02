const { ticketService } = require("./../services");
const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");

exports.userAddTicket = async (req, res) => {
	const { title, text, priority, departmentId } = req.body;
	const io = req.app.get("socketIo");
	const data = await ticketService.userAddTicket(
		req.userEntity._id,
		title,
		text,
		priority,
		departmentId,
		req.files,
		io,
	);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userEditTicket = async (req, res) => {
	const { id, title, text, priority, departmentId } = req.body;
	const data = await ticketService.userEditTicket(
		req.userEntity._id,
		id,
		title,
		text,
		priority,
		departmentId,
		req.files,
	);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userGetTickets = async (req, res) => {
	const data = await ticketService.userGetTickets(req.query, req.userEntity._id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userGetTicket = async (req, res) => {
	const { id } = req.params;
	const data = await ticketService.userGetTicket(req.userEntity._id, id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userDeleteTicket = async (req, res) => {
	const { id } = req.params;
	const data = await ticketService.userDeleteTicket(req.userEntity._id, id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userChangeTicketStatus = async (req, res) => {
	const { id } = req.params;
	const { status } = req.query;
	const data = await ticketService.userChangeTicketStatus(req.userEntity._id, id, status);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerAddTicket = async (req, res) => {
	const io = req.app.get("socketIo");
	const { userId, title, text, priority, departmentId, managerId } = req.body;
	const data = await ticketService.managerAddTicket(
		managerId,
		userId,
		title,
		text,
		priority,
		departmentId,
		req.files,
		io,
	);

	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerEditTicket = async (req, res) => {
	try {
		const { id, title, text, priority, departmentId, note, tag, status, managerId } = req.body;
		const { isGeneral } = req.userEntity;

		const data = await ticketService.managerEditTicket(
			isGeneral,
			managerId,
			id,
			title,
			text,
			priority,
			departmentId,
			note,
			tag,
			status,
			req.files,
		);
		return response({ res, statusCode: httpStatus.CREATED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.managerGetTickets = async (req, res) => {
	const isGeneral = req.userEntity.isGeneral;
	const managerId = req.userEntity._id;
	// if (req.query.type == "MANAGER") data = await ticketService.managerGetTickets(req.query.userId, req.query);
	// else
	data = await ticketService.managerGetTickets(
		req.query.userId, //1
		req.query,
		isGeneral,
		managerId,
	);

	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerGetTicket = async (req, res) => {
	const { id } = req.params;

	const data = await ticketService.managerGetTicket(req.query, id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerDeleteTicket = async (req, res) => {
	const { id } = req.params;
	const data = await ticketService.managerDeleteTicket(id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerChangeTicketStatus = async (req, res) => {
	const { status, id } = req.body;
	const data = await ticketService.managerChangeTicketStatus(id, status);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerChangeTicketDepartment = async (req, res) => {
	const { id } = req.params;
	const { departmentId } = req.body;
	const data = await ticketService.managerChangeTicketDepartment(id, departmentId);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerApproveReply = async (req, res) => {
	try {
		const { id } = req.params;
		const { text } = req.body;
		const { isGeneral } = req.userEntity;
		const io = req.app.get("socketIo");

		const data = await ticketService.managerApproveReply(id, text, isGeneral, io);
		return response({ res, statusCode: httpStatus.CREATED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.managerAcceptTicket = async (req, res) => {
	const { id } = req.params;
	const data = await ticketService.managerAcceptTicket(req.session.userId, id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userAddReply = async (req, res) => {
	const { ticketId, text } = req.body;
	const io = req.app.get("socketIo");
	const data = await ticketService.userAddReply(req.userEntity._id, ticketId, text, req.files, io);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userEditReply = async (req, res) => {
	const { id, ticketId, text } = req.body;
	const data = await ticketService.userEditReply(req.userEntity._id, id, ticketId, text, req.files);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userGetReplies = async (req, res) => {
	const data = await ticketService.userGetReplies(req.userEntity._id, req.query);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userGetReply = async (req, res) => {
	const { id } = req.params;
	const data = await ticketService.userGetReply(req.userEntity._id, id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.userDeleteReply = async (req, res) => {
	const { id } = req.params;
	const data = await ticketService.userDeleteReply(req.userEntity._id, id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerAddReply = async (req, res) => {
	const { ticketId, text, managerId } = req.body;
	const { isGeneral } = req.userEntity;
	const io = req.app.get("socketIo");
	const data = await ticketService.managerAddReply(req, managerId, isGeneral, ticketId, text, req.files, io);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerEditReply = async (req, res) => {
	const { id, ticketId, text, managerId } = req.body;
	const data = await ticketService.managerEditReply(managerId, id, ticketId, text, req.files);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerGetReplies = async (req, res) => {
	const data = await ticketService.managerGetReplies(req.query);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerGetReply = async (req, res) => {
	const { id } = req.params;
	const data = await ticketService.managerGetReply(id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerDeleteReply = async (req, res) => {
	const { id } = req.params;
	const data = await ticketService.managerDeleteReply(id);
	return response({ res, statusCode: httpStatus.CREATED, data });
};

exports.managerGetReplyTemplates = async (req, res) => {
	const data = await ticketService.managerGetReplyTemplates(req.query);
	return response({ res, statusCode: httpStatus.OK, data });
};

exports.managerGetReplyTemplateById = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await ticketService.managerGetReplyTemplateById(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.managerAddReplyTemplate = async (req, res) => {
	try {
		const data = await ticketService.managerAddReplyTemplate(req.body);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		if (!e.statusCode) e = { statusCode: 500, status: "Internal Error", message: e.message };
		return res.status(e.statusCode).json(e);
	}
};

exports.managerDeleteReplyTemplate = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await ticketService.managerDeleteReplyTemplate(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		if (!e.statusCode) e = { statusCode: 500, status: "Internal Error", message: e.message };
		return res.status(e.statusCode).json(e);
	}
};

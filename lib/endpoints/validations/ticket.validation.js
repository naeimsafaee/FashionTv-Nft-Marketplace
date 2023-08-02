const Joi = require("joi");

const userAddTicket = {
	body: {
		title: Joi.string(),
		text: Joi.string(),
		priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").default("LOW"),
		departmentId: Joi.string(),
	},
};
const userEditTicket = {
	body: {
		id: Joi.string(),
		title: Joi.string(),
		text: Joi.string(),
		priority: Joi.string().valid("LOW", "MEDIUM", "HIGH"),
		departmentId: Joi.string(),
	},
};
const userGetTickets = {
	query: {
		priority: Joi.string().valid("LOW", "MEDIUM", "HIGH"),
		departmentId: Joi.string(),
		status: Joi.string().valid("CREATED", "REPLIED", "CLOSED"),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		sortDirection: Joi.valid("ASC", "DESC").default("DESC"),
		userId: Joi.string(),
	},
};
const userGetTicket = {
	params: {
		id: Joi.string(),
	},
};
const userDeleteTicket = {
	params: {
		id: Joi.string(),
	},
};
const userChangeTicketStatus = {
	params: {
		id: Joi.string(),
	},
	query: {
		status: Joi.string().valid("CREATED", "REPLIED", "CLOSED"),
	},
};
const managerAddTicket = {
	body: {
		userId: Joi.string().min(1),
		title: Joi.string(),
		text: Joi.string(),
		priority: Joi.string().valid("LOW", "MEDIUM", "HIGH").default("LOW"),
		managerId: Joi.string().min(1),
		departmentId: Joi.string().min(1),
	},
};
const managerEditTicket = {
	body: {
		id: Joi.string(),
		title: Joi.string(),
		text: Joi.string(),
		priority: Joi.string().valid("LOW", "MEDIUM", "HIGH"),
		departmentId: Joi.string(),
		managerId: Joi.string(),
		note: Joi.string(),
		tag: Joi.string(),
		status: Joi.string(),
	},
};
const managerGetTickets = {
	query: {
		userId: Joi.string(),
		id: Joi.string(),
		type: Joi.string().valid("MANAGER", "USER").default("MANAGER"),
		priority: Joi.array().items(Joi.valid("LOW", "MEDIUM", "HIGH")),
		departmentId: Joi.string(),
		status: Joi.array().items(Joi.valid("CREATED", "REPLIED", "CLOSED", "PENDING")),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		//sortDirection: Joi.valid("asc", "desc").default("desc"),
		userName: Joi.string(),
		title: Joi.string(),
		code: Joi.string(),
		departmentName: Joi.string(),
		createdAt: Joi.date(),
		searchQuery: Joi.string().allow(null, ""),
		sort: Joi.string().default("createdAt"),
		order: Joi.valid("DESC", "ASC").default("ASC"),
	},
};
const managerGetTicket = {
	params: {
		id: Joi.string(),
	},
	query: {
		userId: Joi.string(),
	},
};
const managerDeleteTicket = {
	params: {
		id: Joi.string(),
	},
};
const managerChangeTicketStatus = {
	body: {
		status: Joi.string(),
		id: Joi.string(),
	},
};

const managerChangeTicketDepartment = {
	body: {
		departmentId: Joi.string().min(1).required(),
	},
};
const managerAcceptTicket = {
	params: {
		id: Joi.string(),
	},
};

const userAddReply = {
	body: {
		ticketId: Joi.string(),
		text: Joi.string(),
	},
};
const userEditReply = {
	body: {
		id: Joi.string(),
		ticketId: Joi.string(),
		text: Joi.string(),
	},
};
const userGetReplies = {
	query: {
		ticketId: Joi.string(),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("ASC", "DESC").default("DESC"),
	},
};
const userGetReply = {
	params: {
		id: Joi.string(),
	},
};
const userDeleteReply = {
	params: {
		id: Joi.string(),
	},
};
const managerAddReply = {
	body: {
		ticketId: Joi.string(),
		text: Joi.string(),
		managerId: Joi.string(),
	},
};
const managerEditReply = {
	body: {
		id: Joi.string(),
		ticketId: Joi.string(),
		text: Joi.string(),
		managerId: Joi.string(),
	},
};
const managerApproveReply = {
	body: {
		text: Joi.string().required(),
	},
};
const managerGetReplies = {
	query: {
		ticketId: Joi.string(),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("ASC", "DESC").default("DESC"),
		sort: Joi.string().default("createdAt"),
	},
};

const managerGetReply = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const managerDeleteReply = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const managerGetReplyTemplates = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		id: Joi.string().min(1),
		name: Joi.string(),
	},
};

const managerGetReplyTemplateById = {
	params: {
		id: Joi.string().required(),
	},
};

const managerAddReplyTemplate = {
	body: {
		name: Joi.string().required(),
		text: Joi.string().required(),
	},
};

const managerDeleteReplyTemplate = {
	params: {
		id: Joi.string().required(),
	},
};

module.exports = {
	userAddTicket,
	userEditTicket,
	userGetTickets,
	userGetTicket,
	userDeleteTicket,
	userChangeTicketStatus,
	managerAddTicket,
	managerEditTicket,
	managerGetTickets,
	managerGetTicket,
	managerDeleteTicket,
	managerChangeTicketStatus,
	managerChangeTicketDepartment,
	managerAcceptTicket,

	userAddReply,
	userEditReply,
	userGetReplies,
	userGetReply,
	userDeleteReply,
	managerAddReply,
	managerEditReply,
	managerApproveReply,
	managerGetReplies,
	managerGetReply,
	managerDeleteReply,

	managerGetReplyTemplates,
	managerGetReplyTemplateById,
	managerAddReplyTemplate,
	managerDeleteReplyTemplate,
};

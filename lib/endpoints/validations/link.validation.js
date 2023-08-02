const Joi = require("joi");

const addLink = {
	body: {
		name: Joi.string().required(),
		type: Joi.valid("REGISTER").default("REGISTER"),
	},
};

const editLink = {
	body: {
		id: Joi.string().required(),
		name: Joi.string(),
		type: Joi.valid("REGISTER").default("REGISTER"),
	},
};

const deleteLink = {
	params: {
		id: Joi.string().required(),
	},
};

const getLink = {
	params: {
		id: Joi.string().required(),
	},
};

const getLinks = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		sort: Joi.string().default("createdAt"),
		order: Joi.string().valid("ASC", "DESC").default("DESC"),
		name: Joi.string(),
		id: Joi.string(),
	},
};

const getLinkByManager = {
	params: {
		id: Joi.string().required(),
	},
};

const getLinksByManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		sort: Joi.string().default("createdAt"),
		order: Joi.string().valid("ASC", "DESC").default("DESC"),
		name: Joi.string(),
	},
};

const getStatistics = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		sort: Joi.string().default("id"),
		order: Joi.string().valid("ASC", "DESC").default("DESC"),
		searchQuery: Joi.string(),
	},
};

const getLinkStatistics = {
	params: {
		id: Joi.string().required(),
	},
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		sort: Joi.string().default("createdAt"),
		order: Joi.string().valid("ASC", "DESC").default("DESC"),
		searchQuery: Joi.string(),
	},
};

const getCommissionsChart = {
	query: {
		start: Joi.string().required(),
		end: Joi.string().required(),
	},
};

const getRegisterChart = {
	query: {
		start: Joi.date().required(),
		end: Joi.date().required(),
	},
};

const getClickChart = {
	query: {
		start: Joi.date().required(),
		end: Joi.date().required(),
	},
};

const directReferral = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		sort: Joi.string().default("createdAt"),
		order: Joi.string().valid("ASC", "DESC").default("DESC"),
		searchQuery: Joi.string(),
	},
};

const clientCommission = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		sort: Joi.string().default("createdAt"),
		order: Joi.string().valid("ASC", "DESC").default("DESC"),
		start: Joi.string(),
		end: Joi.string(),
	},
};

module.exports = {
	addLink,
	editLink,
	deleteLink,
	getLink,
	getLinks,
	getLinkByManager,
	getLinksByManager,
	getStatistics,
	getLinkStatistics,
	getCommissionsChart,
	getRegisterChart,
	getClickChart,
	directReferral,
	clientCommission,
};

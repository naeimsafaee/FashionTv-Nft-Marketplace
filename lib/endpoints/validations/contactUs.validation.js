const Joi = require("joi");

const addContactUs = {
	body: {
		email: Joi.string().email().required(),
		title: Joi.string().min(4).max(256).required(),
		description: Joi.string().max(1000).required(),
		gRecaptchaResponse: Joi.string(),
	},
};

const getOneContactUs = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllContactUs = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(50).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		search: Joi.string(),
	},
};

const getAllContactUsByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(50).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		title: Joi.string(),
		email: Joi.string(),
		description: Joi.string(),
		searchQuery: Joi.string(),
		createdAt: Joi.string(),
	},
};

module.exports = {
	addContactUs,
	getOneContactUs,
	getAllContactUs,
	getAllContactUsByManager,
};

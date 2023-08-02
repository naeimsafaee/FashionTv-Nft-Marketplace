const Joi = require("joi");

const addSubscribe = {
	body: {
		email: Joi.string().email().required(),
	},
};

const getOneSubscribe = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllSubscribes = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(50).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		search: Joi.string(),
	},
};

const getAllSubscribesByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(50).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		searchQuery: Joi.string(),
		email: Joi.string(),
		createdAt: Joi.string(),
	},
};

module.exports = {
	addSubscribe,
	getOneSubscribe,
	getAllSubscribes,
	getAllSubscribesByManager,
};

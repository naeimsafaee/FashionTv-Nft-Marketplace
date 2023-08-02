const Joi = require("joi");

const getOneActivity = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllActivityByManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		type: Joi.string(),
		collectionId: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		assignTokenId: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		price: Joi.number(),
		quantity: Joi.number(),
		createdAt: Joi.string(),
	},
};

const activitySelectorByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, "").empty(),
	},
};

const getPriceHistory = {
	query: {
		from: Joi.date().required(),
		to: Joi.date().required(),
		id: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

module.exports = {
	getOneActivity,
	getAllActivityByManager,
	activitySelectorByManager,
	getPriceHistory,
};

const Joi = require("joi");

const addCategory = {
	body: {
		title: Joi.string().required().max(30),
		description: Joi.string().allow(null).empty().max(200),
		type: Joi.valid("COLLECTION", "CONTENT").required(),
	},
};

const editCategory = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		title: Joi.string().max(30),
		description: Joi.string().allow(null).empty().max(20),
		type: Joi.valid("COLLECTION", "CONTENT"),
	},
};

const getCategory = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getCategories = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(50).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		title: Joi.string(),
		description: Joi.string(),
		searchQuery: Joi.string(),
		type: Joi.string().valid("COLLECTION", "CONTENT"),
		createdAt: Joi.string(),
	},
};

const categorySelector = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, ""),
		title: Joi.string(),
		description: Joi.string(),
		type: Joi.array().items(Joi.string().valid("COLLECTION", "CONTENT")),
		createdAt: Joi.string(),
	},
};

const getCategoriesByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(50).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		title: Joi.string(),
		description: Joi.string(),
		type: Joi.array().items(Joi.string().valid("COLLECTION", "CONTENT")),
		createdAt: Joi.string(),
		searchQuery: Joi.string(),
	},
};

module.exports = {
	addCategory,
	getCategories,
	getCategory,
	editCategory,
	categorySelector,
	getCategoriesByManager,
};

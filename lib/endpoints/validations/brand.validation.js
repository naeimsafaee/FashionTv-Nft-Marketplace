const Joi = require("joi");

const addBrands = {
	body: {
		title: Joi.string().required(),
		link: Joi.string().required(),
	},
};

const editBrands = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		title: Joi.string().required(),
		link: Joi.string().required(),
	},
};

const getBrand = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getBrands = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		search: Joi.string(),
	},
};

const getBrandsManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		title: Joi.string(),
		searchQuery: Joi.string(),
		createdAt: Joi.string(),
	},
};

module.exports = {
	addBrands,
	editBrands,
	getBrand,
	getBrands,
	getBrandsManager,
};

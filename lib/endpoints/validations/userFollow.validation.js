const Joi = require("joi");

const getOneUserFollow = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllUserFollowByManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		user: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		followers: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		following: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const userFollowSelectorByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, "").empty(),
	},
};

module.exports = {
	getOneUserFollow,
	getAllUserFollowByManager,
	userFollowSelectorByManager,
};

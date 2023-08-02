const Joi = require("joi");

const getOneUserFavorites = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllUserFavoritesByManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		user: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		collectionId: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		tokenId: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		createdAt: Joi.string(),
	},
};

const userFavoritesSelectorByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, "").empty(),
	},
};

module.exports = {
	getOneUserFavorites,
	getAllUserFavoritesByManager,
	userFavoritesSelectorByManager,
};

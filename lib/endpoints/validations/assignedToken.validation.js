const Joi = require("joi");

const getOneAssignedToken = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllAssignedTokenByManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		user: Joi.string(),
		name: Joi.string(),
		chain: Joi.array().items(Joi.string().valid("ETHEREUM", "POLYGON", "BSC")),
		status: Joi.array().items(
			Joi.string().valid("FREE", "IN_AUCTION", "TRANSFERRED", "SOLD", "PENDING", "BURNED", "NOT_MINTED"),
		),
		collection: Joi.string(),
		createdAt: Joi.string(),
		searchQuery: Joi.string(),
	},
};

const assignedTokenSelectorByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		status: Joi.array().items(Joi.string().valid("FREE", "IN_AUCTION", "TRANSFERRED", "SOLD", "PENDING", "BURNED")),
		searchQuery: Joi.string().allow(null, "").empty(),
	},
};

module.exports = {
	getOneAssignedToken,
	getAllAssignedTokenByManager,
	assignedTokenSelectorByManager,
};

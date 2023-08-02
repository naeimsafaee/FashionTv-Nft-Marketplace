const Joi = require("joi");

const addDiamondType = {
	body: {
		name: Joi.string().required(),
		price: Joi.number(),
	},
};

const editDiamondType = {
	body: {
		name: Joi.string(),
		price: Joi.number(),
	},
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const deleteDiamondType = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getDiamondType = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getDiamondTypes = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("ASC"),
		sort: Joi.string().default("order").valid("createdAt", "updatedAt", "id", "name", "status", "order"),
		searchQuery: Joi.string().allow(null, ""),
		createdAt: Joi.date(),
		id: Joi.string(),
		name: Joi.string(),
		status: Joi.array().items(Joi.string().valid("ACTIVE", "INACTIVE")),
	},
};

const getDiamondTypeByManager = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getDiamondTypesByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt").valid("createdAt", "updatedAt", "id", "name", "status", "price"),
		searchQuery: Joi.string().allow(null, ""),
		createdAt: Joi.date(),
		id: Joi.string(),
		name: Joi.string(),
		price: Joi.number(),
		status: Joi.array().items(Joi.string().valid("ACTIVE", "INACTIVE")),
		swapConstant: Joi.number().min(0),
	},
};

module.exports = {
	addDiamondType,
	editDiamondType,
	deleteDiamondType,
	getDiamondType,
	getDiamondTypes,
	getDiamondTypeByManager,
	getDiamondTypesByManager,
};

const Joi = require("joi");

const editTransaction = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		status: Joi.valid("AUDITING", "PENDING", "REJECTED", "DONE"),
	},
};

const getTransactions = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		id: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		//type: Joi.valid("ARTICLE", "FAQ", "ABOUT"),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		createdAt: Joi.string(),
		sort: Joi.string().default("createdAt").valid("createdAt", "updatedAt", "amount"),
		searchQuery: Joi.string().allow(null, ""),
		coin: Joi.string().allow(null, ""),
		username: Joi.string().allow(null, ""),
		previousBalance: Joi.number(),
		index: Joi.number(),
		type: Joi.array().items(Joi.string().valid("DEPOSIT", "WITHDRAW", "TRANSFER", "SWAP")),
		profit: Joi.number(),
		amount: Joi.number(),
	},
};

const getById = {
	params: {
		id: Joi.string().required(),
	},
};

module.exports = {
	getTransactions,
	editTransaction,
	getById
};

const Joi = require("joi");

const getSwapTransactionByManager = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllSwapTransactionByManager = {
	query: {
		id: Joi.string(),
		assetOut: Joi.string(),
		assetIn: Joi.string(),
		user: Joi.string(),
		txId: Joi.string(),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("id"),
		createdAt: Joi.date(),
		amount: Joi.number(),
		fee: Joi.number(),
		balanceIn: Joi.number(),
		amountOut: Joi.number(),
		searchQuery: Joi.string().allow(null, ""),
	},
};

module.exports = {
	getSwapTransactionByManager,
	getAllSwapTransactionByManager,
};

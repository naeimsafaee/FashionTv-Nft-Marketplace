const Joi = require("joi");

const getPrizes = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		id: Joi.string(),
		title: Joi.string(),
		createdAt: Joi.date(),
		searchQuery: Joi.string().allow(null, ""),
		sort: Joi.string().default("createdAt"),
		diamondTypeId: Joi.array(),
		asset: Joi.string(),
		rank: Joi.string(),
		amount: Joi.number(),
	},
};

const getPrize = {
	params: {
		id: Joi.string(),
	},
};

const addPrize = {
	body: {
		title: Joi.string().required(),
		rank: Joi.string().required(),
		amount: Joi.number().required(),
		assetId: Joi.string().required(),
		diamondTypeId: Joi.string().required(),
	},
};

const editPrize = {
	params: {
		id: Joi.string().required(),
	},
	body: {
		title: Joi.string().required(),
		rank: Joi.string().required(),
		amount: Joi.number().required(),
		assetId: Joi.string().required(),
		diamondTypeId: Joi.string().required(),
	},
};

const delPrize = {
	params: {
		id: Joi.string().required(),
	},
};

module.exports = {
	getPrizes,
	getPrize,
	addPrize,
	editPrize,
	delPrize,
};

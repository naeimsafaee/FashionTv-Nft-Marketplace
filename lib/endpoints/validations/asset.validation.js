const Joi = require("joi");

const getAssets = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(10).max(100).default(10),
	},
};

const getAssetSingle = {
	params: {
		id: Joi.string().required(),
	},
};

const depositList = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(10).max(100).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		assetNetworkId: Joi.number().integer().min(1),
		address: Joi.string(),
		tag: Joi.string(),
		status: Joi.array().valid(Joi.valid("AUDITING", "PENDING", "REJECTED", "DONE")),
		txid: Joi.string(),
		info: Joi.string(),
		account: Joi.valid("ALGOTREX"),
		assetId: Joi.number().integer().min(1),
		index: Joi.number().integer().min(0),
	},
	params: {
		id: Joi.number().integer().min(1),
	},
};

const confirmWithdraw = {
	body: {
		token: Joi.string().max(300).required(),
		code: Joi.string().length(4).required(),
	},
};

const withdrawRequest = {
	body: {
		id: Joi.required(),
		address: Joi.string()
			.regex(/^0x[a-fA-F0-9]{40}$/)
			.message(" is not valid")
			.required(),
		amount: Joi.number().positive().required(),
		tag: Joi.string(),
		from_agent_panel: Joi.boolean(),
		save: Joi.boolean().default(false),
		signer: Joi.string().required(),
	},
};

const swap = {
	body: {
		amount: Joi.number().positive().required(),
		assetInId: Joi.string().required(),
		assetOutId: Joi.string().required(),
		origin: Joi.string().required().default("out").valid("in", "out"),
	},
};

module.exports = {
	getAssets,
	getAssetSingle,
	depositList,
	confirmWithdraw,
	withdrawRequest,
	swap,
};

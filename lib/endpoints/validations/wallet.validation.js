const Joi = require("joi");

const verify = {
	body: {
		token: Joi.string().max(300).required(),
		code: Joi.string().length(4).required(),
	},
};

const config = {
	query: {
		type: Joi.valid("withdraw", "deposit").default("deposit"),
		coin: Joi.string().uppercase(),
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		sort: Joi.string().default("createdAt"),
		searchQuery: Joi.string(),
		createdAt: Joi.string(),
	},
};

const getWalletsManager = {
	query: {
		id: Joi.number().min(1),
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		assetId: Joi.number().min(1),
		userId: Joi.number().min(1),
		isLocked: Joi.boolean(),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		createdAt: Joi.date(),
	},
};

const getWallets = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		assetId: Joi.number().min(1),
		isLocked: Joi.boolean(),
		order: Joi.valid("DESC", "ASC").default("DESC"),
	},
};

const getWallet = {
	query: {
		id: Joi.number().min(1),
	},
};

const editAmountWalletManager = {
	query: {
		amount: Joi.number().min(1),
	},
};

const list = {
	query: {
		type: Joi.valid("withdraw", "deposit").required(),
	},
};

const getSystemWallets = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).max(100).default(10),
		sort: Joi.string().default("createdAt"),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		search: Joi.string().allow(null, ""),
	},
};

const getSystemWallet = {
	params: {
		id: Joi.number().required(),
	},
};

const editSystemWallet = {
	body: {
		id: Joi.number().required(),
		amount: Joi.number(),
	},
};

const giveawayGetAll = {
	params: {
		id: Joi.number(),
		user: Joi.number(),
		asset: Joi.number(),
	},
};

module.exports = {
	verify,
	giveawayGetAll,
	config,
	list,
	getWalletsManager,
	getWallets,
	getWallet,
	editAmountWalletManager,
	getSystemWallets,
	getSystemWallet,
	editSystemWallet,
};

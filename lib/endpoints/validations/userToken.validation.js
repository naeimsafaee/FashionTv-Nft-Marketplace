const Joi = require("joi");
const Web3 = require("web3");

const addUserToken = {
	body: {
		name: Joi.string().min(1).max(256).required(),
		description: Joi.string().allow(null).max(400).required(),
		supply: Joi.number().min(1).default(1),
		collectionId: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		explicitContent: Joi.boolean().default(false),
		chain: Joi.valid("ETHEREUM", "POLYGON", "BSC").required(),
		unblockableContent: Joi.string().max(200),
		url: Joi.string(),
		properties: Joi.string(),
		isLazyMint: Joi.boolean().required(),
		gRecaptchaResponse: Joi.string(),
	},
};

const updateUserToken = {
	body: {
		tokenId: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		// txId: Joi.string(),
	},
};

const likeUnlikeToken = {
	body: {
		tokenId: Joi.string().required(),
	},
};
const editUserToken = {
	body: {},
};

const getUserToken = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getUserTokens = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		// chain: Joi.valid("ETH").default("ETH"),
		// explicitContent: Joi.boolean(),
		user: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		collection: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		// createdAt: Joi.string(),
	},
};

const getUserTokensByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		isSlider: Joi.array().items(Joi.string().valid("true", "false")),
		isTrend: Joi.array().items(Joi.string().valid("true", "false")),
		name: Joi.string(),
		user: Joi.string(),
		collection: Joi.string(),
		status: Joi.array().items(Joi.string().valid("FREE", "IN_AUCTION", "TRANSFERRED", "SOLD", "PENDING", "BURNED")),
		chain: Joi.array().items(Joi.string().valid("ETHEREUM", "POLYGON")),
		createdAt: Joi.string(),
		searchQuery: Joi.string(),
	},
};

const userTokenSelector = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, ""),
	},
};

const getUserPendingTokens = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
	},
};

const getTokenUnblockableContent = {
	params: {
		id: Joi.string()
			.hex()
			.length(24)
			.messages({
				"string.hex": " invalid",
				"string.length": " invalid",
			})
			.required(),
	},
};

const editUserTokenByManager = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		isTrend: Joi.boolean(),
		isSlider: Joi.boolean(),
	},
};

const importToken = {
	body: {
		chain: Joi.valid("ETHEREUM", "POLYGON").required(),
		address: Joi.string()
			.custom((value, helpers) => {
				if (!Web3.utils.isAddress(value)) return helpers.message(" is not valid address");

				return value;
			})
			.required()
			.lowercase(),
	},
};

const userDiamond = {
	query: {
		user: Joi.string()
			.hex()
			.length(24)
			.messages({
				"string.hex": " invalid",
				"string.length": " invalid",
			})
			.required(),
	},
};

module.exports = {
	addUserToken,
	editUserToken,
	getUserToken,
	getUserTokens,
	userTokenSelector,
	likeUnlikeToken,
	updateUserToken,
	getUserPendingTokens,
	getTokenUnblockableContent,
	editUserTokenByManager,
	importToken,
	getUserTokensByManager,
	userDiamond,
};

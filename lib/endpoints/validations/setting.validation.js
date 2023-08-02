const Joi = require("joi");

const addSetting = {
	body: {
		key: Joi.string()
			.required()
			.valid(
				"MINT_FEE_ETHEREUM",
				"MINT_FEE_POLYGON",
				"AUCTION_FEE_ETHEREUM",
				"AUCTION_FEE_POLYGON",
				"AUCTION_ADDRESS_ETHEREUM",
				"AUCTION_ADDRESS_POLYGON",
				"MAKE_OFFER_FEE_ETHEREUM",
				"MAKE_OFFER_FEE_POLYGON",
				"MAKE_OFFER_ADDRESS_ETHEREUM",
				"MAKE_OFFER_ADDRESS_POLYGON",
				"MAKE_BID_FEE_ETHEREUM",
				"MAKE_BID_FEE_POLYGON",
				"MAKE_BID_ADDRESS_ETHEREUM",
				"MAKE_BID_ADDRESS_POLYGON",
				"CANCEL_AUCTION_FEE_ETHEREUM",
				"CANCEL_AUCTION_FEE_POLYGON",
				"CANCEL_AUCTION_ADDRESS_ETHEREUM",
				"CANCEL_AUCTION_ADDRESS_POLYGON",
				"CANCEL_OFFER_FEE_ETHEREUM",
				"CANCEL_OFFER_FEE_POLYGON",
				"CANCEL_OFFER_ADDRESS_ETHEREUM",
				"CANCEL_OFFER_ADDRESS_POLYGON",
				"CANCEL_BID_FEE_ETHEREUM",
				"CANCEL_BID_FEE_POLYGON",
				"CANCEL_BID_ADDRESS_ETHEREUM",
				"CANCEL_BID_ADDRESS_POLYGON",
			),
		value: Joi.string().required().min(1),
	},
};

const editSetting = {
	body: {
		key: Joi.string()
			.required()
			.valid(
				"MINT_FEE_ETHEREUM",
				"MINT_FEE_POLYGON",
				"AUCTION_FEE_ETHEREUM",
				"AUCTION_FEE_POLYGON",
				"AUCTION_ADDRESS_ETHEREUM",
				"AUCTION_ADDRESS_POLYGON",
				"MAKE_OFFER_FEE_ETHEREUM",
				"MAKE_OFFER_FEE_POLYGON",
				"MAKE_OFFER_ADDRESS_ETHEREUM",
				"MAKE_OFFER_ADDRESS_POLYGON",
				"MAKE_BID_FEE_ETHEREUM",
				"MAKE_BID_FEE_POLYGON",
				"MAKE_BID_ADDRESS_ETHEREUM",
				"MAKE_BID_ADDRESS_POLYGON",
				"CANCEL_AUCTION_FEE_ETHEREUM",
				"CANCEL_AUCTION_FEE_POLYGON",
				"CANCEL_AUCTION_ADDRESS_ETHEREUM",
				"CANCEL_AUCTION_ADDRESS_POLYGON",
				"CANCEL_OFFER_FEE_ETHEREUM",
				"CANCEL_OFFER_FEE_POLYGON",
				"CANCEL_OFFER_ADDRESS_ETHEREUM",
				"CANCEL_OFFER_ADDRESS_POLYGON",
				"CANCEL_BID_FEE_ETHEREUM",
				"CANCEL_BID_FEE_POLYGON",
				"CANCEL_BID_ADDRESS_ETHEREUM",
				"CANCEL_BID_ADDRESS_POLYGON",
			),
		value: Joi.string().required().min(1),
	},
};

const getSetting = {
	query: {
		type: Joi.string().required().valid("MINT", "AUCTION", "TRANSACTION"),
		chain: Joi.string().valid("ETHEREUM", "POLYGON", "BSC").required(),
	},
};
const getSettings = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		key: Joi.string(),
		value: Joi.string(),
		createdAt: Joi.string(),
		searchQuery: Joi.string(),
	},
};

module.exports = {
	addSetting,
	editSetting,
	getSetting,
	getSettings,
};

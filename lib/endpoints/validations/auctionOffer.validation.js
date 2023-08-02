const Joi = require("joi");
const moment = require("moment");

const addAuctionOffer = {
	body: {
		auctionId: Joi.string()
			.hex()
			.length(24)
			.messages({
				"string.hex": " invalid",
				"string.length": " invalid",
			})
			.allow(null),
		assignedTokenId: Joi.string()
			.hex()
			.length(24)
			.messages({
				"string.hex": " invalid",
				"string.length": " invalid",
			})
			.when("auctionId", { is: null, then: Joi.required(), otherwise: Joi.optional() }),
		expiresAt: Joi.date()
			.when("auctionId", {
				is: null,
				then: Joi.required(),
				otherwise: Joi.date().default(moment().add(10, "days").toDate()),
			})
			.custom((value, helpers) => {
				let current = Date.now() + 900000;

				if (value < current) return helpers.message(" must be at least 15 minutes after the current date");

				return value;
			}),
		signature: Joi.string().required(),
		amount: Joi.number().greater(0).required(),
	},
};
const editAuctionOffer = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		amount: Joi.number(),
	},
};

const deleteAuctionOffer = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const changeStatus = {
	param: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getOneAuctionOffer = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};
const auctionOfferSelector = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllAuctionOfferByManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		user: Joi.string(),
		collection: Joi.string(),
		token: Joi.string(),
		amount: Joi.number(),
		searchQuery: Joi.string().allow(null, "").empty(),
		status: Joi.array().items(Joi.string().valid("CANCEL", "REGISTER", "ACCEPTED", "DENIED")),
		auctionStatus: Joi.array().items(Joi.string().valid("ACTIVE", "INACTIVE", "FINISH")),
		type: Joi.string().valid("assignedToken", "auction"),
		createdAt: Joi.string(),
	},
};

const auctionOfferSelectorByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, "").empty(),
	},
};
const getUserOffers = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
	},
};

module.exports = {
	addAuctionOffer,
	editAuctionOffer,
	deleteAuctionOffer,
	changeStatus,
	auctionOfferSelector,
	getOneAuctionOffer,
	getAllAuctionOfferByManager,
	auctionOfferSelectorByManager,
	getUserOffers,
};

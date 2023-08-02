const Joi = require("joi");

const addAuction = {
	body: {
		assignTokenId: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		start: Joi.date()
			.required()
			.custom((value, helpers) => {
				let { start, end } = helpers.state.ancestors[0];

				if (start >= end) return helpers.message(" is bigger than end");

				return value;
			}),
		end: Joi.date()
			.required()
			.custom((value, helpers) => {
				let current = Date.now() + 900000;

				if (value < current) return helpers.message(" date must be at least 15 minutes after the start date");

				return value;
			}),
		immediatePrice: Joi.number().greater(0).allow(null),
		basePrice: Joi.when("immediatePrice", {
			is: null,
			then: Joi.number().greater(0).required(),
			otherwise: Joi.valid(null),
		}),
		bookingPrice: Joi.when("immediatePrice", {
			is: null,
			then: Joi.number().greater(0),
			otherwise: Joi.valid(null),
		}),
		signature: Joi.when("immediatePrice", {
			is: Joi.number().greater(0),
			then: Joi.string(),
			otherwise: Joi.valid(null),
		}),
		reserveAddress: Joi.when("immediatePrice", {
			is: Joi.number().greater(0),
			then: Joi.string(),
			otherwise: Joi.valid(null),
		}),
		serial: Joi.string(),
	},
};

const deleteAuction = {
	id: Joi.string().allow(null).hex().length(24).messages({
		"string.hex": " invalid",
		"string.length": " invalid",
	}),
};

const getAllAuction = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		userId: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		assignTokenId: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		start: Joi.string(),
		end: Joi.string(),
		basePrice: Joi.number(),
		immediatePrice: Joi.number(),
		bookingPrice: Joi.number(),
		status: Joi.valid("ACTIVE", "INACTIVE", "FINISH"),
		createdAt: Joi.string(),
	},
};

const auctionSelector = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		searchQuery: Joi.string().allow(null, "").empty(),
	},
};

const getOneAuction = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getAllAuctionByManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		user: Joi.string(),
		token: Joi.string(),
		collection: Joi.string(),
		basePrice: Joi.number(),
		immediatePrice: Joi.number(),
		bookingPrice: Joi.number(),
		status: Joi.array().items(Joi.string().valid("ACTIVE", "INACTIVE", "FINISH")),
		start: Joi.string(),
		end: Joi.string(),
		searchQuery: Joi.string(),
	},
};

const auctionSelectorByManager = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		searchQuery: Joi.string().allow(null, "").empty(),
	},
};

const getAuctionTradesManager = {
	query: {
		id: Joi.string(),
		auctionId: Joi.string(),
		payerId: Joi.string(),
		payeeId: Joi.string(),
		diamondTypeId: Joi.array().items(Joi.string().valid("Super Rare", "Limited", "Rare", "Unique", "Common")),
		diamondId: Joi.string(),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("id"),
		createdAt: Joi.date(),
		amount: Joi.number(),
		fee: Joi.number().min(0),
		payer: Joi.string(),
		payee: Joi.string(),
		searchQuery: Joi.string().allow(null, ""),
	},
};

const getAuctionTradeManager = {
	params: {
		id: Joi.string(),
	},
};
module.exports = {
	addAuction,
	deleteAuction,
	getAllAuction,
	auctionSelector,
	getOneAuction,
	getAllAuctionByManager,
	auctionSelectorByManager,
	getAuctionTradeManager,
	getAuctionTradesManager,
};

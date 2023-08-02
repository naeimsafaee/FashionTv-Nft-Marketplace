const Joi = require("joi");

const generalSearch = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		searchQuery: Joi.string().allow(null, ""),
	},
};

const searchUsername = {
	query: {
		username: Joi.string().required(),
	},
};

const explore = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		category: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		createdAt: Joi.string(),
	},
};

const topSellers = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
	},
};

const popularCollections = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
	},
};

const featuredUsers = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
	},
};

const featuredCollections = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
	},
};

const trendingArts = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
	},
};

const assets = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		sort: Joi.string()
			.valid(
				"createdAt",
				"recentlyListed",
				"recentlySold",
				"recentlyReceived",
				"endingSoon",
				"priceLowToHigh",
				"priceHighToLow",
				"highestLastSale",
				"mostFavorited",
			)
			.default("createdAt"),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		search: Joi.string(),
		min: Joi.number(),
		max: Joi.number(),
		collections: Joi.array(),
		categories: Joi.array(),
		status: Joi.array(),
		chain: Joi.array(),
		createdAt: Joi.boolean(),
		recentlySold: Joi.boolean(),
		recentlyReceived: Joi.boolean(),
		endingSoon: Joi.boolean(),
		priceLowToHigh: Joi.boolean(),
		priceHighToLow: Joi.boolean(),
		highestLastSale: Joi.boolean(),
	},
};

const collectionSearch = {
	query: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		sort: Joi.string()
			.valid(
				"createdAt",
				"recentlyListed",
				"recentlySold",
				"recentlyReceived",
				"endingSoon",
				"priceLowToHigh",
				"priceHighToLow",
				"highestLastSale",
				"mostFavorited",
			)
			.default("createdAt"),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		search: Joi.string(),
		min: Joi.number(),
		max: Joi.number(),
		collections: Joi.array(),
		categories: Joi.array(),
		status: Joi.array(), //.valid(Joi.string().valid("FREE", "IN_AUCTION", "OFFERS", "TRANSFERED", "SOLD")),
		chain: Joi.array(),
		createdAt: Joi.boolean(),
		recentlySold: Joi.boolean(),
		recentlyReceived: Joi.boolean(),
		endingSoon: Joi.boolean(),
		priceLowToHigh: Joi.boolean(),
		priceHighToLow: Joi.boolean(),
		highestLastSale: Joi.boolean(),
		properties: Joi.array(),
	},
};

const slider = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
	},
};

const customExplore = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string()
			.valid(
				"createdAt",
				"recentlyListed",
				"recentlySold",
				"recentlyReceived",
				"endingSoon",
				"priceLowToHigh",
				"priceHighToLow",
				"highestLastSale",
				"mostFavorited",
			)
			.default("createdAt"),
		createdAt: Joi.string(),
		user: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		search: Joi.string(),
		min: Joi.number(),
		max: Joi.number(),
		collections: Joi.array(),
		status: Joi.array(),
		chain: Joi.array(),
		properties: Joi.array(),
	},
};

const ranking = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		sort: Joi.string().valid("volume", "floorPrice", "owners", "items").default("volume"),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		categoryId: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		collectionId: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		type: Joi.string().valid("24H", "7D", "30D", "ALL").default("7D"),
	},
};

const tabsInfo = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		sort: Joi.string().valid("volume", "floorPrice", "owners", "items").default("volume"),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		// search: Joi.string(),
		type: Joi.string().valid("LISTING", "SELLES", "OFFERS", "TRANSFER", "MINT").default("LISTING"),
		// collections: Joi.array(),
	},
};

const calculator = {
	body: {
		diamondTypeId: Joi.string().required(),
		rankPosition: Joi.number().required(),
		days: Joi.number().required().min(1)
	}
};

module.exports = {
	generalSearch,
	searchUsername,
	explore,
	topSellers,
	popularCollections,
	assets,
	featuredUsers,
	trendingArts,
	collectionSearch,
	slider,
	customExplore,
	ranking,
	tabsInfo,
	featuredCollections,
	calculator
};

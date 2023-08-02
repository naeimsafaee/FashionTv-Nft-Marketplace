const Joi = require("joi");

const getDiamonds = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		searchQuery: Joi.string().allow(null, ""),
		createdAt: Joi.date(),
		id: Joi.string(),
		name: Joi.string(),
		description: Joi.string(),
		diamondTypeId: Joi.array(),
		diamondType: Joi.string(),
		edition: Joi.number(),
	},
};

const addDiamond = {
	body: {
		name: Joi.string(),
		description: Joi.string(),
		diamondTypeId: Joi.string(),
		edition: Joi.number(),
		status: Joi.string(),
		image: Joi.string(),
		ipfsImage: Joi.string(),
		serialNumber: Joi.string(),
		allowedUsageNumber: Joi.string(),
		attributes: Joi.string(),
		price: Joi.number(),
		amount: Joi.number(),
		sellCount: Joi.number(),
	},
};

const getDiamond = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getDiamondTypes = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const addAuctionDiamond = {
	body: {
		diamondTypeId: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		immediatePrice: Joi.number().min(0),
		initialNumber: Joi.number().min(1).required(),
	},
};

const getAuctionDiamonds = {
	query: {
		diamondTypeId: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		immediatePrice: Joi.number().min(0),
		createdAt: Joi.string(),
		max: Joi.number().max(100000),
		min: Joi.number().min(0),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("ASC"),
		sort: Joi.string().default("createdAt"),
	},
};

const getDiamondTypesByManager = {
	query: {
		diamondTypeId: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		diamond: Joi.string(),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		price: Joi.string(),
		user: Joi.string(),
		diamondType: Joi.string(),
		searchQuery: Joi.string(),
		status: Joi.array().items(Joi.string().valid("ACTIVE", "INACTIVE", "FINISHED", "RESERVED")),
	},
};
const getDiamondTypeByManager = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const createAssignedCard = {
	body: {
		userId: Joi.string().required(),
		diamondTypeId: Joi.string().required()
	},
};

const getAssignedCard = {
	query: {
		id: Joi.number().min(1),
		userId: Joi.string(),
		diamond: Joi.string(),
		user: Joi.string(),
		diamondTypeId: Joi.array(),
		tokenId: Joi.number(),
		type: Joi.array().items(Joi.valid("TRANSFER", "REWARD", "WITHDRAW", "SOLD" , "BOX")),
		status: Joi.array().items(Joi.valid("FREE", "INGAME", "INAUCTION", "IN_BOX" , "RESERVED")),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("id"),
		orderCard: Joi.valid("DESC", "ASC"),
		sortCard: Joi.string(),
		orderUser: Joi.valid("DESC", "ASC"),
		sortUser: Joi.string(),
		createdAt: Joi.date(),
		searchQuery: Joi.string().allow(null, ""),
	},
};


module.exports = {
	getDiamonds,
	getDiamond,
	addDiamond,
	getDiamondTypes,
	addAuctionDiamond,
	getDiamondTypesByManager,
	getDiamondTypeByManager,
	getAuctionDiamonds,
	getAssignedCard,
	createAssignedCard
};

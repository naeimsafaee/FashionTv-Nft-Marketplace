const Joi = require("joi");
const { userStatus } = require("../../data/constans");

const addUsers = {
	body: {
		address: Joi.string().required(), // Temporary
		username: Joi.string().required(),
		description: Joi.string().required().max(400),
		email: Joi.string().allow(null).empty(),
		isVerified: Joi.boolean(),
		status: Joi.string(),
		link: Joi.string(),
		level: Joi.valid("NORMAL", "AGENT").default("NORMAL"),
		fee: Joi.number(),
		password: Joi.string(),
	},
};
const userFollowUnfollow = {
	body: {
		address: Joi.string().required(),
	},
};

const inviteLink = {
	params: {
		code: Joi.string().length(6).required(),
	},
};

const getReferral = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
	},
};

const editUsers = {
	body: {
		username: Joi.string().allow(null).empty().max(30),
		description: Joi.string().allow(null).empty().max(120),
		email: Joi.string().allow(null).empty().email().max(30),
		link: Joi.string().max(300),
	},
};

const editUsersByManager = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		username: Joi.string().allow(null).empty().max(30),
		description: Joi.string().allow(null).empty().max(120),
		email: Joi.string().allow(null).empty().email().max(30),
		isVerified: Joi.boolean(),
		isFeatured: Joi.boolean(),
		status: Joi.string(),
		link: Joi.string(),
		level: Joi.valid("NORMAL", "AGENT").default("NORMAL"),
		fee: Joi.number(),
		password: Joi.string(),
	},
};

const findUserById = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
	query: {
		requestedUserId: Joi.string().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const getUsers = {
	query: {
		id: Joi.string(),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		sort: Joi.string().default("createdAt"),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		username: Joi.string(),
		email: Joi.string(),
		//isVerified: Joi.boolean(),
		isFeatured: Joi.array().items(Joi.string().valid("true", "false")),
		status: Joi.array().items(Joi.string().valid("ACTIVE", "PENDING", "INACTIVE")),
		address: Joi.string(),
		createdAt: Joi.string(),
		searchQuery: Joi.string(),
	},
};

const getSelector = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		searchQuery: Joi.string().allow(null, ""),
	},
};
const getUserFollowers = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		address: Joi.string().required(),
	},
};
const getUserFollowing = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		address: Joi.string().required(),
	},
};

const getUserFavouriteToken = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
	},
};

const notification = {
	query: {
		type: Joi.string().valid("public", "private").allow(null),
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		status: Joi.boolean(),
	},
};

const updateNotification = {
	body: {
		fcm_token: Joi.string().required(),
	},
};

const readNotification = {
	body: {
		notification_id: Joi.array().required(),
	},
};

const sendUserNotif = {
	body: {
		userId: Joi.string().required(),
		title: Joi.string().required(),
		description: Joi.string().required(),
	},
};

const addReferralCode = {
	body: {
		referredCode: Joi.string().required(),
	},
};

module.exports = {
	addUsers,
	editUsers,
	findUserById,
	getUsers,
	getSelector,
	editUsersByManager,
	userFollowUnfollow,
	getUserFollowers,
	getUserFollowing,
	getUserFavouriteToken,
	notification,
	updateNotification,
	readNotification,
	sendUserNotif,
	addReferralCode,
	inviteLink,
	getReferral
};

const Joi = require("joi");

const addBlogs = {
	body: {
		title: Joi.string().required(),
		category: Joi.string().allow(null).empty().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		description: Joi.string().required(),
		isHome: Joi.boolean(),
		status: Joi.valid("ACTIVE", "INACTIVE").default("ACTIVE"),
		type: Joi.valid("FAQ", "ARTICLE", "ABOUT").default("ARTICLE"),
		text: Joi.string(),
		video: Joi.string(),
	},
};

const editBlogs = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		title: Joi.string(),
		description: Joi.string().allow(null).empty(),
		text: Joi.string(),
		category: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		images: Joi.valid(null),
		thumbnails: Joi.valid(null),
		isHome: Joi.boolean(),
		status: Joi.valid("ACTIVE", "INACTIVE").default("ACTIVE"),
		type: Joi.valid("FAQ", "ARTICLE", "ABOUT").default("ARTICLE"),
		video: Joi.string(),
	},
};

const getBlog = {
	params: {
		slug: Joi.string().required(),
	},
};

const getBlogs = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		id: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		category: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		type: Joi.valid("ARTICLE", "FAQ", "ABOUT"),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		isHome: Joi.boolean(),
		createdAt: Joi.string(),
	},
};

const getBlogCategories = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string(),
		search: Joi.string(),
	},
};

const blogSelector = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, "").empty(),
		category: Joi.string().allow(null).hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		category: Joi.string(),
		type: Joi.valid("ARTICLE", "FAQ", "ABOUT"),
	},
};
const relatedBlogs = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		type: Joi.valid("COLLECTION", "BLOG").default("BLOG"),
		searchQuery: Joi.string().allow(null, "").empty(),
	},
};

const getBlogByManager = {
	params: {
		id: Joi.string().required(),
	},
};

const getBlogsByManager = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		sort: Joi.string().default("createdAt"),
		title: Joi.string(),
		category: Joi.string(),
		status: Joi.array().items(Joi.string().valid("ACTIVE", "INACTIVE")),
		type: Joi.array().items(Joi.string().valid("ARTICLE", "FAQ", "ABOUT")),
		createdAt: Joi.string(),
		searchQuery: Joi.string(),
	},
};

module.exports = {
	addBlogs,
	editBlogs,
	getBlog,
	getBlogs,
	blogSelector,
	relatedBlogs,
	getBlogByManager,
	getBlogsByManager,
	getBlogCategories,
};

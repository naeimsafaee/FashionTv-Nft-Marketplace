const Joi = require("joi");

const getAllNotifications = {
	query: {
		page: Joi.number().min(1).default(1),
		limit: Joi.number().min(1).default(10),
		order: Joi.valid("DESC", "ASC").default("DESC"),
	},
};

module.exports = {
	getAllNotifications,
};

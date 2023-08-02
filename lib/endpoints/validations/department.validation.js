const Joi = require("joi");

const addDepartment = {
	body: {
		name: Joi.string().required(),
		description: Joi.string(),
		headManagerId: Joi.string().required(),
		managersId: Joi.array().items(Joi.string()),
	},
};

const editDepartment = {
	body: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
		name: Joi.string(),
		description: Joi.string(),
		headManagerId: Joi.string(),
		managersId: Joi.array(),
		// addedManagersId: Joi.array(),
		// removedManagersId: Joi.array(),
	},
};

const getDepartments = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, ""),
		sort: Joi.string().default("createdAt"),
		name: Joi.string(),
		description: Joi.string(),
		managerEmail: Joi.string(),
		managerMobile: Joi.string(),
		managerName: Joi.string(),
	},
};

const getDepartment = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const deleteDepartment = {
	params: {
		id: Joi.string().required().hex().length(24).messages({
			"string.hex": " invalid",
			"string.length": " invalid",
		}),
	},
};

const departmentSelector = {
	query: {
		page: Joi.number().default(1).min(1),
		limit: Joi.number().default(10).min(1).max(100),
		order: Joi.valid("DESC", "ASC").default("DESC"),
		searchQuery: Joi.string().allow(null, ""),
		sort: Joi.string().default("createdAt"),
		name: Joi.string(),
		description: Joi.string(),
		managerEmail: Joi.string(),
		managerMobile: Joi.string(),
		managerName: Joi.string(),
	},
};

module.exports = {
	addDepartment,
	editDepartment,
	getDepartment,
	deleteDepartment,
	departmentSelector,
	getDepartments,
};

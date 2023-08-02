const Joi = require("joi");

const login = {
	body: {
		mobile: Joi.string().min(8).max(20),
		email: Joi.string().email(),
		password: Joi.string()
			// .regex(/^(?=.?[A-Z])(?=.?[a-z])(?=.?[0-9])(?=.?[#?!@$%^&*-]).{8,64}$/)
			.required(),
	},
};

module.exports = {
	login,
};

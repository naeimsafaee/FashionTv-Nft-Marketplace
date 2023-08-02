const _ = require("lodash");
const { UNPROCESSABLE_ENTITY } = require("./StatusCode");

module.exports = class HumanError extends Error {
	status;
	statusCode;
	message;
	fields;

	constructor(errors, code, fields) {
		super("business logic error");

		Error.captureStackTrace(this, HumanError);

		this.status = UNPROCESSABLE_ENTITY.status;
		this.statusCode = UNPROCESSABLE_ENTITY.code;
		this.lang = {
			code,
		};
		if (_.isString(errors) || _.isArray(errors)) {
			this.message = errors;
			this.fields = fields;
		} else {
			throw new Error("HumanError: illegal argument");
		}
	}
};

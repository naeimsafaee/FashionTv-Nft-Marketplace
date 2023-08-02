const { NOT_FOUND } = require("./StatusCode");

module.exports = class NotFoundError extends Error {
	status;
	statusCode;
	message;
	fields;

	constructor(errors, code, fields) {
		super("not found");

		Error.captureStackTrace(this, NotFoundError);

		this.status = NOT_FOUND.status;
		this.statusCode = NOT_FOUND.code;
		this.lang = {
			code,
		};
		this.message = errors;
		this.fields = fields;
	}
};

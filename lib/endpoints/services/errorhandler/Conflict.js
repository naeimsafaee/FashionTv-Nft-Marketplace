const { CONFLICT } = require("./StatusCode");

module.exports = class Conflict extends Error {
	status;
	statusCode;
	message;
	fields;

	constructor(errors, code, fields) {
		super("Conflict");

		Error.captureStackTrace(this, Conflict);

		this.status = CONFLICT.status;
		this.statusCode = CONFLICT.code;
		this.lang = {
			code,
		};
		this.message = errors;
		this.fields = fields;
	}
};

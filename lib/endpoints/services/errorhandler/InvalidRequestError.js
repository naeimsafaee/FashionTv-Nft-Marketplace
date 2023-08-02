const _ = require("lodash");
const { BAD_REQUEST } = require("./StatusCode");

module.exports = class InvalidRequestError extends Error {
	status;
	statusCode;
	message;
	fields;

	constructor(description, code) {
		super(`invalid request: ${description}`);
		Error.captureStackTrace(this, InvalidRequestError);

		this.message = description;
		this.status = BAD_REQUEST.status;
		this.statusCode = BAD_REQUEST.code;
		this.lang = {
			code,
		};
	}
};

const { UNAUTHORIZED } = require("./StatusCode");

module.exports = class NotAuthenticatedError extends Error {
	status;
	statusCode;
	rawErrors;
	message;

	constructor(code, errors) {
		super("not authenticated");

		Error.captureStackTrace(this, NotAuthenticatedError);

		this.status = UNAUTHORIZED.status;
		this.statusCode = UNAUTHORIZED.code;
		this.message = errors;
		this.lang = {
			code: code,
		};
	}
};

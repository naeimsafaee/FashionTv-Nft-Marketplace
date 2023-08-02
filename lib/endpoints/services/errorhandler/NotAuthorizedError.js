const { FORBIDDEN } = require("./StatusCode");

module.exports = class NotAuthorizedError extends Error {
	status;
	statusCode;
	rawErrors;
	message;

	constructor(code, errors) {
		super("not authorized");

		Error.captureStackTrace(this, NotAuthorizedError);

		this.status = FORBIDDEN.status;
		this.statusCode = FORBIDDEN.code;
		this.message = errors;
		this.lang = {
			code: code,
		};
	}
};

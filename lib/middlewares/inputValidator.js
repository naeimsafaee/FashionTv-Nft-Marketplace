const Joi = require("joi");
const { pick, httpResponse, httpStatus } = require("./../utils");
const { BAD_REQUEST } = require("../endpoints/services/errorhandler/StatusCode");
const validate = (schema) => (req, res, next) => {
	const validSchema = pick(schema, ["params", "query", "body"]);
	const object = pick(req, Object.keys(validSchema));
	const { value, error } = Joi.compile(validSchema)
		.prefs({ errors: { label: "key" } })
		.validate(object);

	if (error) {
		let errorMessage = "";
		for (const err of error.details) {
			errorMessage += err.message.replace('"', "").replace('"', "");
		}
		return res.status(BAD_REQUEST.code).json({
			status: BAD_REQUEST.status,
			statusCode: BAD_REQUEST.code,
			message: null,
			error: errorMessage,
		});
	}
	Object.assign(req, value);
	return next();
};

module.exports = validate;

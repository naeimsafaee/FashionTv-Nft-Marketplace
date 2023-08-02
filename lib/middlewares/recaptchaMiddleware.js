const config = require("config");
const axios = require("axios");
const Errors = require("../endpoints/services/errorhandler/MessageText");
const InvalidRequestError = require("../endpoints/services/errorhandler/InvalidRequestError");
function throwError() {
	throw new InvalidRequestError(
		Errors.RECAPTCHA_VERIFICATION_FAILED.MESSAGE,
		Errors.RECAPTCHA_VERIFICATION_FAILED.CODE,
	);
}
exports.recaptchaMiddleware = async (req, res, next) => {
	try {
		if (
			req.body["gRecaptchaResponse"] === undefined ||
			req.body["gRecaptchaResponse"] === "" ||
			req.body["gRecaptchaResponse"] === null
		) {
			return throwError();
		}
		const secretKey = config.get("captcha.recaptchaV2SecKey");

		const verificationURL = await axios.get(
			"https://www.google.com/recaptcha/api/siteverify?secret=" +
				secretKey +
				"&response=" +
				req.body.gRecaptchaResponse +
				"&remoteip=" +
				req.connection.remoteAddress,
		);

		if (verificationURL.data.success !== undefined && !verificationURL.data.success) {
			return throwError();
		} else {
			return next();
		}
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

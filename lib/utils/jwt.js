const JWT = require("jsonwebtoken");
const config = require("config");
const managerConfig = config.get("authentication.manager");
const publicConfig = config.get("authentication.public");

function generate(payload, secret, expiresIn, userType) {
	try {
		if (userType == "manager") {
			secret = managerConfig.secret;
		} else {
			secret = publicConfig.secret;
		}
		const token = JWT.sign(payload, secret, { expiresIn: expiresIn });
		return token;
	} catch (e) {
		return null;
	}
}

function decode() {
	try {
		const decoded = JWT.decode(token, { complete: true });
		return decoded;
	} catch (e) {
		return null;
	}
}

function verify(token, secret, userType) {
	try {
		if (userType == "manager") secret = managerConfig.secret;
		else secret = publicConfig.secret;
		const verified = JWT.verify(token, secret, { complete: true });
		return verified?.payload ?? null;
	} catch (e) {
		return null;
	}
}

class Token {
	constructor(userId, userType) {
		this.userId = userId;
		this.userType = userType;
		this.date = new Date();
		this.config = managerConfig;
		this.secret = this.config.secret;
		this.accessExpiresAt = +this.date + +this.config.accessExpiry * 1000;
		this.refreshExpiresAt = +this.date + +this.config.refreshExpiry * 1000;
		this.refreshExpiry = this.config.refreshExpiry;
		this.accessExpiry = this.config.accessExpiry;
	}

	generateRefresh() {
		return generate(
			{
				id: this.userId,
				userType: this.userType,
				tokenType: "refresh",
				expiresAt: this.refreshExpiresAt,
			},
			this.secret,
			this.refreshExpiry,
			this.userType,
		);
	}

	// generateAccess(sessionId) {
	// 	if (!sessionId) return null;
	// 	return generate(
	// 		{
	// 			id: this.userId,
	// 			userType: this.userType,
	// 			tokenType: "access",
	// 			sessionId,
	// 			expiresAt: this.accessExpiresAt,
	// 		},
	// 		this.secret,
	// 		this.accessExpiry,
	// 		this.userType,
	// 	);
	// }
	generateAccess() {
		return generate(
			{
				id: this.userId,
				userType: this.userType,
				tokenType: "access",
				expiresAt: this.accessExpiresAt,
			},
			this.secret,
			this.accessExpiry,
			this.userType,
		);
	}
	generateAccessUser() {
		return generate(
			{
				id: this.userId,
				userType: this.userType,
				tokenType: "access",
				expiresAt: this.accessExpiresAt,
			},
			this.secret,
			this.accessExpiry,
			this.userType,
		);
	}
}

module.exports = {
	generate,
	decode,
	verify,
	Token,
};

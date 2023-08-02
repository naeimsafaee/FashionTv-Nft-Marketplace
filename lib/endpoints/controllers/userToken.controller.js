const {
	httpResponse: { response },
	httpStatus,
} = require("./../../utils");

const { userTokenService } = require("../services");

exports.addToken = async (req, res) => {
	try {
		const {
			name,
			description,
			supply,
			chain,
			unblockableContent,
			url,
			explicitContent,
			properties,
			collectionId,
			isLazyMint,
		} = req.body;
		const data = await userTokenService.addToken(
			name,
			description,
			supply,
			chain,
			unblockableContent,
			url,
			explicitContent,
			properties,
			req.files,
			collectionId,
			req.userEntity,
			req.fileValidationError,
			isLazyMint,
		);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		console.log(e);
		return res.status(e.statusCode).json(e);
	}
};

/**
 * update user token
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.updateToken = async (req, res) => {
	try {
		const { tokenId, txId } = req.body;
		const data = await userTokenService.updateToken(req.userEntity.id, tokenId, txId);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		console.log(e);
		return res.status(e.statusCode).json(e);
	}
};

exports.getTokens = async (req, res) => {
	try {
		const data = await userTokenService.getTokens(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getToken = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await userTokenService.getToken(id, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.tokenSelector = async (req, res) => {
	try {
		const { page, limit, order, searchQuery } = req.query;
		const data = await userTokenService.tokenSelector(page, limit, order, searchQuery);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.getTokensByManager = async (req, res) => {
	try {
		const data = await userTokenService.getTokens(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getTokenByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await userTokenService.getToken(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.tokenSelectorByManager = async (req, res) => {
	try {
		const { page, limit, order, searchQuery } = req.query;
		const data = await userTokenService.tokenSelector(page, limit, order, searchQuery);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserPendingTokens = async (req, res) => {
	try {
		const data = await userTokenService.getUserPendingTokens(req.query, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getTokenUnblockableContent = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await userTokenService.getTokenUnblockableContent(id, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.editUserTokenByManager = async (req, res) => {
	try {
		const { id, isTrend, isSlider } = req.body;
		const data = await userTokenService.editUserTokenByManager(id, isTrend, isSlider);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		console.log(e);
		return res.status(e.statusCode).json(e);
	}
};

exports.getTokensCount = async (req, res) => {
	try {
		const data = await userTokenService.getTokensCount(req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * import existing token from user
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.importToken = async (req, res) => {
	try {
		const data = await userTokenService.importToken(req.userEntity, req.body);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.userDiamonds = async (req, res) => {
	try {
		const data = await userTokenService.userDiamonds(req.query.user, req.body);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

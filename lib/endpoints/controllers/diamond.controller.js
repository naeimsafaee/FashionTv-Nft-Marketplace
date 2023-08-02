const { diamondService } = require("../services");
const {
	httpStatus,
	httpResponse: { response },
} = require("../../utils");

/**
 * get Diamond list
 */
exports.addDiamond = async (req, res) => {
	try {
		const data = await diamondService.addDiamond(req.body, req.files);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		if (!e.statusCode) return res.status(500).json(e);
		return res.status(e.statusCode).json(e);
	}
};
/**
 * get Diamond list
 */
exports.getDiamonds = async (req, res) => {
	try {
		const data = await diamondService.getDiamonds(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get one Diamond
 */
exports.getDiamond = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await diamondService.getDiamond(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
/**
 * Auction Diamond
 */
exports.addAuctionDiamonds = async (req, res) => {
	try {
		const data = await diamondService.addAuctionDiamonds(req.body);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get auction list
 */
exports.getAuctionDiamonds = async (req, res) => {
	try {
		const data = await diamondService.getAuctionDiamonds(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get auction list
 */
exports.getAuctionDiamondsByManager = async (req, res) => {
	try {
		const data = await diamondService.getAuctionDiamondsByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAuctionDiamondByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await diamondService.getAuctionDiamondByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get one Diamond
 */
exports.getDiamondByUserDiamondId = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await diamondService.getDiamondByUserDiamondId(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.getDiamondByUserDiamond = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await diamondService.getDiamondByUserDiamond(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};


/**
 * get assigned card list
 */
exports.createAssignedCard = async (req, res) => {
	const data = await diamondService.createAssignedCard(req.body);
	return response({res, statusCode: httpStatus.OK, data});
};

/**
 * get assigned card list
 */
exports.getAssignedCard = async (req, res) => {
	const data = await diamondService.getAssignedCard(req.query);
	return response({res, statusCode: httpStatus.OK, data});
};

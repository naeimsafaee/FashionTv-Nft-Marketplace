const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { auctionService } = require("../services");

/**
 * add user auction
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.addAuction = async (req, res) => {
	try {
		const data = await auctionService.addAuction(req.body, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get auction signature
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getAuction = async (req, res) => {
	try {
		const data = await auctionService.getAuction(req.params.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * delete user auction
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteAuction = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await auctionService.deleteAuction(id, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getOneAuction = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await auctionService.getOneAuction(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllAuction = async (req, res) => {
	try {
		const data = await auctionService.getAllAuction(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.auctionSelector = async (req, res) => {
	try {
		const data = await auctionService.auctionSelector(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getOneAuctionByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await auctionService.getOneAuctionByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllAuctionByManager = async (req, res) => {
	try {
		const data = await auctionService.getAllAuctionByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.auctionSelectorByManager = async (req, res) => {
	try {
		const data = await auctionService.auctionSelectorByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get auction settings
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getSettings = async (req, res) => {
	try {
		const data = await auctionService.getSettings();
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};



/**
 * get auction trades list Manager
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getAuctionTradesManager = async (req, res) => {
	try {
		const data = await auctionService.getAuctionTradesManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get auction trade Manager
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getAuctionTradeManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await auctionService.getAuctionTradeManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

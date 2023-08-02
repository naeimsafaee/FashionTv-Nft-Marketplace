const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { auctionOfferService } = require("../services");

exports.addAuctionOffer = async (req, res) => {
	try {
		const data = await auctionOfferService.addAuctionOffer(req.body, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.editAuctionOffer = async (req, res) => {
	try {
		const { id, auctionId, amount } = req.body;
		const data = await auctionOfferService.editAuctionOffer(id, auctionId, amount, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * delete auction offers
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteAuctionOffer = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await auctionOfferService.deleteAuctionOffer(id, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get offer signature
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getOneAuctionOffer = async (req, res) => {
	try {
		const data = await auctionOfferService.getOneAuctionOffer(req.params.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.auctionSelectorOffer = async (req, res) => {
	try {
		const data = await auctionOfferService.auctionSelector(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getOneAuctionOfferByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await auctionOfferService.getOneAuctionOfferByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllAuctionOfferByManager = async (req, res) => {
	try {
		const data = await auctionOfferService.getAllAuctionOfferByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.auctionOfferSelectorByManager = async (req, res) => {
	try {
		const data = await auctionOfferService.auctionOfferSelectorByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserOffers = async (req, res) => {
	try {
		const data = await auctionOfferService.getUserOffers(req.query, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserOffersOthers = async (req, res) => {
	try {
		const data = await auctionOfferService.getUserOffersOthers(req.query, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

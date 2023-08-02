const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");

const { customService } = require("../services");

exports.generalSearch = async (req, res) => {
	try {
		const { page, limit, order, sort, searchQuery } = req.query;
		const data = await customService.generalSearch(page, limit, order, sort, searchQuery);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.searchUsername = async (req, res) => {
	try {
		const { username } = req.query;
		const data = await customService.searchUsername(username, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.explore = async (req, res) => {
	try {
		const { page, limit, order, sort, category, user, collection } = req.query;
		const data = await customService.explore(page, limit, order, sort, category, user, collection);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.topSellers = async (req, res) => {
	try {
		const { page, limit, order, sort } = req.query;
		const data = await customService.topSellers(page, limit, order, sort);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.popularCollections = async (req, res) => {
	try {
		const data = await customService.popularCollections(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.assets = async (req, res) => {
	try {
		const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

		const data = await customService.assets(req.query , req.userEntity?._id , ip);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.featuredUsers = async (req, res) => {
	try {
		const data = await customService.featuredUsers(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.featuredCollections = async (req, res) => {
	try {
		const data = await customService.featuredCollections(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.trendingArts = async (req, res) => {
	try {
		const data = await customService.trendingArts(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.collectionSearch = async (req, res) => {
	try {
		const data = await customService.collectionSearch(req.query , req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.slider = async (req, res) => {
	try {
		const data = await customService.slider(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.customExplorer = async (req, res) => {
	try {
		const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

		const data = await customService.customExplorer(req.query , req.userEntity?._id , ip);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.ranking = async (req, res) => {
	try {
		const data = await customService.ranking(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.socketTest = async (req, res) => {
	try {
		const data = await customService.socketTest();
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * return polygon gas price;
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.gasPrice = async (req, res) => {
	try {
		return response({ res, statusCode: httpStatus.OK, data: PolygonGasPrice });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};


exports.calculator = async (req, res) => {
	const data = await customService.calculator(req.body);
	return response({ res, statusCode: httpStatus.OK, data });
};
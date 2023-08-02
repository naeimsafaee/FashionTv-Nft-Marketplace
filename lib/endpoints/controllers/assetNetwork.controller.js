const {httpResponse: { response }, httpStatus,} = require("./../../utils");
const { assetNetworkServices } = require("./../services");

/**
 * Get manager assetNetwork
 * @param {*} req
 * @param {*} res
 */
exports.assetNetwork = async (req, res) => {
	try {
		const data = await assetNetworkServices.get(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
/**
 * Get manager assetNetwork Selector
 * @param {*} req
 * @param {*} res
 */
// exports.assetNetworkSelector = async (req, res) => {
// 	try {
// 		const data = await assetNetworkServices.assetNetworkSelector(req.query);
// 		return response({ res, statusCode: httpStatus.OK, data });
// 	} catch (e) {
// 		return res.status(e.statusCode).json(e);
// 	}
// };

exports.searchAssetNetwork = async (req, res) => {
	try {
		const data = await assetNetworkServices.get(req.body);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Add assetNetwork for user
 * @param {*} req
 * @param {*} res
 */
exports.addAssetNetwork = async (req, res) => {
	try {
		const data = await assetNetworkServices.set(req.body);
		return response({ res, statusCode: httpStatus.CREATED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Add assetNetwork for user

 */
exports.editAssetNetwork = async (req, res) => {
	try {
		const data = await assetNetworkServices.edit(req.body);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Add assetNetwork for user
 * @param {*} req
 * @param {*} res
 */
exports.deleteAssetNetwork = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await assetNetworkServices.del(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.findById = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await assetNetworkServices.findById(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};


exports.getNetwork = async (req, res) => {
	try {
		const data = await assetNetworkServices.getNetwork(req.query);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

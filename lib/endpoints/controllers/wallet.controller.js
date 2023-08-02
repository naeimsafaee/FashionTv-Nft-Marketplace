const {
	httpResponse: { response },
	httpStatus,
} = require("../../utils");
const { walletServices } = require("../services");

/**
 * get wallet config by type and coin
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.config = async (req, res) => {
	try {
		const data = await walletServices.config(req.query , req.userEntity._id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Get active asset list for withdraw or deposit
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.list = async (req, res) => {
	const { type } = req.query;
	const data = await walletServices.list(type);
	return response({ res, statusCode: httpStatus.OK, data });
};

/**
 * Get users wallets by manager
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getWalletsManager = async (req, res) => {
	try {
		const data = await walletServices.getAll(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Get wallet by manager
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getWalletManager = async (req, res) => {
	try {
		const data = await walletServices.getOne(req.params);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Edit amount wallet by manager
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.editAmountWalletManager = async (req, res) => {
	try {
		const amount = await req.body.amount;
		const userId = await req.body.id;

		if (userId != undefined && amount != undefined) {
			const data = await walletServices.editAmountWallet(amount, userId);
			return response({ res, statusCode: httpStatus.OK, data });
		}
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Get users wallets
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getWallets = async (req, res) => {
	try {
		const serviceData = {
			...req.query,
			userId: req.userEntity.id,
		};
		const data = await walletServices.getAll(serviceData);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Get one wallet
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getWallet = async (req, res) => {
	try {
		const serviceData = {
			...req.params,
			userId: req.userEntity.id,
		};
		const data = await walletServices.getOne(serviceData);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get user wallet
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getUserWallet = async (req, res) => {
	try {
		const data = await walletServices.getUserWallet(req.userEntity.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getSystemWallets = async (req, res) => {
	try {
		const data = await walletServices.getSystemWallets(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		if (!e.statusCode) e = { statusCode: 500, status: "Internal Error", message: e.message };
		return res.status(e.statusCode).json(e);
	}
};

exports.getSystemWallet = async (req, res) => {
	try {
		const data = await walletServices.getSystemWallet(req.params);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		if (!e.statusCode) e = { statusCode: 500, status: "Internal Error", message: e.message };
		return res.status(e.statusCode).json(e);
	}
};

exports.editSystemWallet = async (req, res) => {
	try {
		const data = await walletServices.editSystemWallet(req.body);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		if (!e.statusCode) e = { statusCode: 500, status: "Internal Error", message: e.message };
		return res.status(e.statusCode).json(e);
	}
};

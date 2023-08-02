const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { financialService } = require("../services");
const {transferCrypto} = require("../services/financial.service");

exports.getAllTransactionByManager = async (req, res) => {
	try {
		const data = await financialService.getAllTransactionByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.updateTransactionByManager = async (req, res) => {
	try {

		const {txId} = await transferCrypto({
			amount: 0.01, // 10 BUSD
			to: '0xcfD440d933f66ca0D5532E3c40324375e726eE23',
			contractAddress: null,//'0xe9e7cea3dedca5984780bafc599bd69add087d56'
		});

		return response({res , data: txId})

		// const data = await financialService.updateTransactionByManager(req.body);
		// return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getById = async (req, res) => {
	try {
		let { id } = req.params;
		const data = await financialService.getById(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
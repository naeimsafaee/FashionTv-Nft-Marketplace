const {httpResponse: {response}, httpStatus,} = require("./../../utils");
const {assetService} = require("./../services");


/**
 * get assets list
 */
exports.getAssets = async (req, res) => {
    try {
        const data = await assetService.getAssets(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * get asset
 */
exports.getAssetSingle = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await assetService.getAssetSingle(id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};


exports.withdrawList = async (req, res) => {
    try {
        const data = await assetService.readTransactions({
            type: "WITHDRAW",
            ...req.params,
            ...req.query,
            userId: req.userEntity._id,
        });
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        console.log({e})
        return res.status(e.statusCode).json(e);
    }
};

exports.confirmWithdraw = async (req, res) => {
    try {
        const io = req.app.get("socketIo");
        const data = await assetService.confirmWithdraw(req.body, req.userEntity, io);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.withdrawRequest = async (req, res) => {
    try {
        const io = req.app.get("socketIo");
        const data = await assetService.withdrawRequest(req.body, req.userEntity._id, io);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        if (!e.statusCode)
            e.statusCode=500
        return res.status(e.statusCode).json(e);
    }
};

const {httpResponse: {response}, httpStatus,} = require("../../utils");
const {purchaseService} = require("../services");



/**
 * buy diamond
 */
exports.purchaseDiamond = async (req, res) => {
    try {
        const data = await purchaseService.purchaseDiamond(req.body, req.userEntity);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};


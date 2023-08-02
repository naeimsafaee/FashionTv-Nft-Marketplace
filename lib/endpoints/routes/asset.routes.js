const router = require("express").Router();

const { assetController } = require("./../controllers");
const { assetValidation } = require("./../validations");
const { authMiddleware, inputValidator } = require("./../../middlewares");

// router.route("/").get(authMiddleware.userAuthMiddleware, assetController.getWallets);

// router
// 	.route("/deposit/:id?")
// 	.post(
// 		authMiddleware.userAuthMiddleware,
// 		inputValidator(assetValidation.depositRequest),
// 		assetController.depositRequest,
// 	)
// 	.get(authMiddleware.userAuthMiddleware, inputValidator(assetValidation.depositList), assetController.depositList);

router
	.route("/withdraw/:id?")
	.get(authMiddleware.userAuthMiddleware, inputValidator(assetValidation.depositList), assetController.withdrawList)
	.put(
		authMiddleware.userAuthMiddleware,
		inputValidator(assetValidation.confirmWithdraw),
		assetController.confirmWithdraw,
	)
	.post(
		authMiddleware.userAuthMiddleware,
		inputValidator(assetValidation.withdrawRequest),
		assetController.withdrawRequest,
	);
//
// router
// 	.route("/swap")
// 	.get(
// 		/*authMiddleware.userAuthMiddleware, */ inputValidator(assetValidation.getSwapRate),
// 		assetController.getSwapRate,
// 	);

module.exports = router;

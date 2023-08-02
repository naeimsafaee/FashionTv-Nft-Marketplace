const { walletController } = require("./../controllers");
const { walletValidation } = require("./../validations");
const { inputValidator, authMiddleware } = require("./../../middlewares");
const router = require("express").Router();

router
	.route("/list")
	.get(authMiddleware.userAuthMiddleware, inputValidator(walletValidation.list), walletController.list);

router
	.route("/config")
	.get(authMiddleware.userAuthMiddleware, inputValidator(walletValidation.config), walletController.config);

module.exports = router;

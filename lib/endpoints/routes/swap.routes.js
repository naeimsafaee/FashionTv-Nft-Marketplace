const { authMiddleware, inputValidator } = require("./../../middlewares");
const { swapController } = require("./../controllers");
const router = require("express").Router();
const { assetValidation } = require("./../validations");

router.route("/").post(authMiddleware.userAuthMiddleware, inputValidator(assetValidation.swap), swapController.add);

router
	.route("/price")
	.post(/*authMiddleware.userAuthMiddleware,*/ inputValidator(assetValidation.swap), swapController.get);

router.route("/get").get(authMiddleware.userAuthMiddleware, swapController.index);

module.exports = router;

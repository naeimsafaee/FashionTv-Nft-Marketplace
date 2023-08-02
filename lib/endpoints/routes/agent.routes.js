const router = require("express").Router();
const { authMiddleware, inputValidator } = require("../../middlewares");
const { agentValidation, linkValidation } = require("../validations");
const {assetController , agentController , linkController} = require("./../controllers");

router.route("/login").post(inputValidator(agentValidation.login), agentController.login);

router.route("/logout").get(authMiddleware.agentAuthMiddleware, agentController.logout);

router.route("/").get(authMiddleware.agentAuthMiddleware, agentController.info);

router.route("/wallet").get(authMiddleware.agentAuthMiddleware, agentController.wallet);

router
	.route("/statistics")
	.get(inputValidator(agentValidation.statistic), authMiddleware.agentAuthMiddleware, agentController.statistics);

router
	.route("/statistics/details")
	.get(
		inputValidator(agentValidation.statisticDetails),
		authMiddleware.agentAuthMiddleware,
		agentController.statisticDetails,
	);

// New Agent Routes
// Links
router
	.route("/links")
	.post(authMiddleware.agentAuthMiddleware, inputValidator(linkValidation.addLink), linkController.createLink)
	.put(authMiddleware.agentAuthMiddleware, inputValidator(linkValidation.editLink), linkController.editLink)
	.get(authMiddleware.agentAuthMiddleware, inputValidator(linkValidation.getLinks), linkController.getLinks);

router
	.route("/links/:id")
	.delete(authMiddleware.agentAuthMiddleware, inputValidator(linkValidation.deleteLink), linkController.deleteLink)
	.get(authMiddleware.agentAuthMiddleware, inputValidator(linkValidation.getLink), linkController.getLink);

// Get One Statisitcs
// router
// 	.route("/links/statistics/:id")
// 	.get(
// 		authMiddleware.agentAuthMiddleware,
// 		inputValidator(linkValidation.getStatistics),
// 		linkController.getStatistics,
// 	);

// Get all Statisitcs
router
	.route("/links/:id/statistics")
	.get(
		authMiddleware.agentAuthMiddleware,
		inputValidator(linkValidation.getLinkStatistics),
		linkController.getLinkStatistics,
	);

// Commission Chart
router
	.route("/links/chart/commission")
	.get(
		authMiddleware.agentAuthMiddleware,
		inputValidator(linkValidation.getCommissionsChart),
		linkController.getCommissionsChart,
	);

// Register Chart
router
	.route("/links/chart/register")
	.get(
		authMiddleware.agentAuthMiddleware,
		inputValidator(linkValidation.getRegisterChart),
		linkController.getRegisterChart,
	);

// Register Chart
router
	.route("/links/chart/click")
	.get(
		authMiddleware.agentAuthMiddleware,
		inputValidator(linkValidation.getClickChart),
		linkController.getClickChart,
	);

// Direct Referral
router
	.route("/links/data/referral")
	.get(
		authMiddleware.agentAuthMiddleware,
		inputValidator(linkValidation.directReferral),
		linkController.directReferral,
	);

// Totals
router.route("/links/data/totals").get(authMiddleware.agentAuthMiddleware, linkController.totals);

// Clinet Commission
router
	.route("/links/data/client-commission")
	.get(
		authMiddleware.agentAuthMiddleware,
		inputValidator(linkValidation.clientCommission),
		linkController.clientCommission,
	);

// router
// 	.route("/withdraw")
// 	.put(
// 		authMiddleware.agentAuthMiddleware,
// 		inputValidator(assetValidation.confirmWithdraw),
// 		assetController.confirmWithdraw,
// 	)
// 	.post(
// 		authMiddleware.agentAuthMiddleware,
// 		inputValidator(assetValidation.withdrawRequest),
// 		assetController.withdrawRequest,
// 	);

module.exports = router;

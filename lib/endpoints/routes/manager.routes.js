const { authMiddleware, inputValidator } = require("./../../middlewares");
const {
	authValidation,
	userValidation,
	blogValidation,
	categoryValidation,
	userCollectionValidation,
	activityValidation,
	assignedTokenValidation,
	auctionValidation,
	auctionOfferValidation,
	userFavoritesValidation,
	userFollowValidation,
	userTokenValidation,
	settingValidation,
	brandValidation,
	notificationsValidation,
	contactUsValidation,
	subscribeValidation,
	competitionValidation,
	diamondValidation,
	diamondTypeValidation,
	prizeValidation,
	assetValidation,
	assetNetworkValidation,
	financialValidation,
	swapValidation,
	ticketValidation,
	departmentValidation,
	managerValidation,
} = require("./../validations");
const {
	authController,
	userController,
	blogController,
	categoryController,
	userCollectionController,
	activityController,
	assignedTokenController,
	auctionController,
	auctionOfferController,
	userFavoritesController,
	userFollowController,
	userTokenController,
	chartController,
	settingController,
	brandController,
	notificationController,
	contactUsController,
	subscribeController,
	competitionController,
	diamondController,
	diamondTypeController,
	prizeController,
	assetController,
	assetNetworkController,
	financialController,
	swapController,
	ticketController,
	departmentController,
	managerController,
} = require("./../controllers");
const {
	avatarUpload,
	categoryImageUpload,
	blogImageUpload,
	brandImageUpload,
	competitionUpload,
	diamondTypeUpload,
	diamondUpload,
	ticketUpload,
} = require("./../../middlewares/s3Uploader");

const { userTokenService } = require("../services");
const router = require("express").Router();
const { permissionMiddleware } = require("../../middlewares/permissionMiddleware");
const { managerLog } = require("../../middlewares/managerLog");

router.route("/login").post(inputValidator(authValidation.login), authController.managerLogin);
router.route("/me").get(authMiddleware.managerAuthMiddleware, authController.getManagerInfo);

// Users

router.route("/test").get(
	authMiddleware.managerAuthMiddleware,
	// permissionMiddleware("user create"),
	// managerLog("user create"),
	userController.test,
);
router
	.route("/users")
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user create"),
		avatarUpload.fields([
			{ name: "background", maxCount: 1 },
			{ name: "image", maxCount: 1 },
		]),
		inputValidator(userValidation.addUsers),
		managerLog("user create"),
		userController.addUsers,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user update"),
		avatarUpload.fields([
			{ name: "background", maxCount: 1 },
			{ name: "image", maxCount: 1 },
		]),
		inputValidator(userValidation.editUsersByManager),
		managerLog("user update"),
		userController.editUsersByManager,
	)
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		inputValidator(userValidation.getUsers),
		managerLog("user read"),
		userController.getUsers,
	);
router
	.route("/users/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		inputValidator(userValidation.getSelector),
		managerLog("user read"),
		userController.getUsersSelector,
	);
router
	.route("/users/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		inputValidator(userValidation.findUserById),
		managerLog("user read"),
		userController.findUserById,
	)

	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user delete"),
		inputValidator(userValidation.findUserById),
		managerLog("user delete"),
		userController.deleteUsers,
	);


//manager
router
	.route("/list")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("manager read"),
		inputValidator(managerValidation.getManagers),
		managerLog("manager read"),
		managerController.getManagers,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("manager create"),
		avatarUpload.fields([{ name: "avatar", maxCount: 1 }]),
		inputValidator(managerValidation.addManagers),
		managerLog("manager create"),
		managerController.addManagers,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("manager update"),
		avatarUpload.fields([{ name: "avatar", maxCount: 1 }]),
		inputValidator(managerValidation.editManagers),
		managerLog("manager update"),
		managerController.editManagers,
	);

router
	.route("/list/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("manager read"),
		inputValidator(managerValidation.findManagerById),
		managerLog("manager read"),
		managerController.findManagerById,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("manager delete"),
		inputValidator(managerValidation.findManagerById),
		managerLog("manager delete"),
		managerController.deleteManagers,
	);

router
	.route("/role")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("role read"),
		inputValidator(managerValidation.getRoles),
		managerLog("role read"),
		managerController.getRoles,
	);
// Category
router
	.route("/category")
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("category create"),
		categoryImageUpload.fields([
			{ name: "light", maxCount: 1 },
			{ name: "dark", maxCount: 1 },
		]),
		inputValidator(categoryValidation.addCategory),
		managerLog("category create"),
		categoryController.addCategory,
	)
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("category read"),
		inputValidator(categoryValidation.getCategoriesByManager),
		managerLog("category read"),
		categoryController.getCategoriesByManager,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("category update"),
		categoryImageUpload.fields([
			{ name: "light", maxCount: 1 },
			{ name: "dark", maxCount: 1 },
		]),
		inputValidator(categoryValidation.editCategory),
		managerLog("category update"),
		categoryController.editCategory,
	);
router
	.route("/category/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("category read"),
		inputValidator(categoryValidation.categorySelector),
		managerLog("category read"),
		categoryController.categorySelectorByManager,
	);
router
	.route("/category/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("category read"),
		inputValidator(categoryValidation.getCategory),
		managerLog("category read"),
		categoryController.getCategoryByManager,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("category delete"),
		inputValidator(categoryValidation.getCategory),
		managerLog("category delete"),
		categoryController.deleteCategory,
	);

// Blog
router
	.route("/blog")
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("announcement create"),
		blogImageUpload.fields([
			{ name: "images", maxCount: 1 },
			{ name: "thumbnails", maxCount: 1 },
		]),
		inputValidator(blogValidation.addBlogs),
		managerLog("announcement create"),
		blogController.addBlog,
	)
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("announcement read"),
		inputValidator(blogValidation.getBlogsByManager),
		managerLog("announcement read"),
		blogController.getBlogsByManager,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("announcement update"),
		blogImageUpload.fields([
			{ name: "images", maxCount: 1 },
			{ name: "thumbnails", maxCount: 1 },
		]),
		inputValidator(blogValidation.editBlogs),
		managerLog("announcement update"),
		blogController.editBlog,
	);
router
	.route("/blog/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("announcement read"),
		inputValidator(blogValidation.blogSelector),
		managerLog("announcement read"),
		blogController.blogSelectorByManager,
	);
router
	.route("/blog/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("announcement read"),
		inputValidator(blogValidation.getBlogByManager),
		managerLog("announcement read"),
		blogController.getBlogByManager,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("announcement delete"),
		inputValidator(blogValidation.getBlogByManager),
		managerLog("announcement delete"),
		blogController.deleteBlog,
	);

// Brands
router
	.route("/brands")
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("brand create"),
		managerLog("brand create"),
		brandImageUpload.fields([{ name: "image", maxCount: 1 }]),
		inputValidator(brandValidation.addBrands),
		brandController.addBrand,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("brand update"),
		managerLog("brand update"),
		brandImageUpload.fields([{ name: "image", maxCount: 1 }]),
		inputValidator(brandValidation.editBrands),
		brandController.editBrand,
	)
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("brand read"),
		managerLog("brand read"),
		inputValidator(brandValidation.getBrandsManager),
		brandController.getBrandsByManager,
	);
router
	.route("/brands/:id")
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("brand delete"),
		managerLog("brand delete"),
		inputValidator(brandValidation.getBrand),
		brandController.deleteBrand,
	)
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("brand read"),
		managerLog("brand read"),
		inputValidator(brandValidation.getBrand),
		brandController.getBrandByManager,
	);

// User Collection
router
	.route("/user-collection")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userCollectionValidation.getUserCollectionsByManager),
		userCollectionController.getUserCollectionsByManager,
	);
router
	.route("/user-collection/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userCollectionValidation.getUserCollection),
		userCollectionController.getUserCollectionByManager,
	);

router
	.route("/user-collection/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userCollectionValidation.userCollectionSelector),
		userCollectionController.userCollectionSelectorByManager,
	);

// User Token
router
	.route("/user-token")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("token read"),
		managerLog("token read"),
		inputValidator(userTokenValidation.getUserTokensByManager),
		userTokenController.getTokensByManager,
	);
router
	.route("/user-token/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("token read"),
		managerLog("token read"),
		inputValidator(userTokenValidation.userTokenSelector),
		userTokenController.tokenSelectorByManager,
	);
router
	.route("/user-token/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("token read"),
		managerLog("token read"),
		inputValidator(userTokenValidation.getUserToken),
		userTokenController.getTokenByManager,
	);
// User Activity
router
	.route("/activity")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("activity read"),
		managerLog("activity read"),
		inputValidator(activityValidation.getAllActivityByManager),
		activityController.getAllActivityByManager,
	);
router
	.route("/activity/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("activity read"),
		managerLog("activity read"),
		inputValidator(activityValidation.activitySelectorByManager),
		activityController.activitySelectorByManager,
	);
router
	.route("/activity/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("activity read"),
		managerLog("activity read"),
		inputValidator(activityValidation.getOneActivity),
		activityController.getOneActivityByManager,
	);

// User Assigned Token
router
	.route("/assigned-token")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(assignedTokenValidation.getAllAssignedTokenByManager),
		assignedTokenController.getAllAssignedTokenByManager,
	);
router
	.route("/assigned-token/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(assignedTokenValidation.assignedTokenSelectorByManager),
		assignedTokenController.assignedTokenSelectorByManager,
	);
router
	.route("/assigned-token/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(assignedTokenValidation.getOneAssignedToken),
		assignedTokenController.getOneAssignedTokenByManager,
	);

// User Auction
router
	.route("/auctions")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("auction read"),
		managerLog("auction read"),
		inputValidator(auctionValidation.getAllAuctionByManager),
		auctionController.getAllAuctionByManager,
	);
router
	.route("/auctions/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("auction read"),
		managerLog("auction read"),
		inputValidator(auctionValidation.auctionSelectorByManager),
		auctionController.auctionSelectorByManager,
	);
router
	.route("/auctions/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("auction read"),
		managerLog("auction read"),
		inputValidator(auctionValidation.getOneAuction),
		auctionController.getOneAuctionByManager,
	);

// User Auction Offer
router
	.route("/auctions-offer")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("auctionOffer read"),
		managerLog("auctionOffer read"),
		inputValidator(auctionOfferValidation.getAllAuctionOfferByManager),
		auctionOfferController.getAllAuctionOfferByManager,
	);
router
	.route("/auctions-offer/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("auctionOffer read"),
		managerLog("auctionOffer read"),
		inputValidator(auctionOfferValidation.auctionOfferSelectorByManager),
		auctionOfferController.auctionOfferSelectorByManager,
	);
router
	.route("/auctions-offer/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("auctionOffer read"),
		managerLog("auctionOffer read"),
		inputValidator(auctionOfferValidation.getOneAuctionOffer),
		auctionOfferController.getOneAuctionOfferByManager,
	);

// User Favorites
//todo
router
	.route("/user-favorites")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userFavoritesValidation.getAllUserFavoritesByManager),
		userFavoritesController.getAllUserFavoritesByManager,
	);
router
	.route("/user-favorites/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userFavoritesValidation.userFavoritesSelectorByManager),
		userFavoritesController.userFavoritesSelectorByManager,
	);
router
	.route("/user-favorites/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userFavoritesValidation.getOneUserFavorites),
		userFavoritesController.getOneUserFavoritesByManager,
	);

// User Follow
//todo
router
	.route("/user-follow")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userFollowValidation.getAllUserFollowByManager),
		userFollowController.getAllUserFollowByManager,
	);
router
	.route("/user-follow/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userFollowValidation.userFollowSelectorByManager),
		userFollowController.userFollowSelectorByManager,
	);
router
	.route("/user-follow/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user read"),
		managerLog("user read"),
		inputValidator(userFollowValidation.getOneUserFollow),
		userFollowController.getOneUserFollowByManager,
	);

router
	.route("/chart/user")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user chart"),
		managerLog("user chart"),
		chartController.UserChart,
	);

router
	.route("/statistics")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("user chart"),
		managerLog("user chart"),
		chartController.UserCounts,
	);

router
	.route("/setting")
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("setting create"),
		inputValidator(settingValidation.addSetting),
		managerLog("setting create"),
		settingController.addSetting,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("setting update"),
		inputValidator(settingValidation.editSetting),
		managerLog("setting update"),
		settingController.editSetting,
	)
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("setting read"),
		inputValidator(settingValidation.getSetting),
		managerLog("setting read"),
		settingController.getSetting,
	);

router
	.route("/settings")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("setting read"),
		inputValidator(settingValidation.getSettings),
		managerLog("setting read"),
		settingController.getSettings,
	);

//todo
router
	.route("/collection")
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("collection update"),
		managerLog("collection update"),
		inputValidator(userCollectionValidation.editUserCollectionByManager),
		userCollectionController.editUserCollectionByManager,
	);
//todo
router
	.route("/token")
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("token update"),
		managerLog("token update"),
		inputValidator(userTokenValidation.editUserTokenByManager),
		userTokenController.editUserTokenByManager,
	);

router
	.route("/notifications")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("notification read"),
		inputValidator(notificationsValidation.getAllNotifications),
		managerLog("notification read"),
		notificationController.getAllManagerNotifications,
	);
router
	.route("/notifications")
	.patch(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("notification update"),
		managerLog("notification update"),
		notificationController.readAllManagerNotifications,
	);
router
	.route("/notifications/:id")
	.patch(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("notification read"),
		managerLog("notification read"),
		notificationController.readOneManagerNotification,
	);

// Contact Us
router
	.route("/contact-us/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("contactUs read"),
		inputValidator(contactUsValidation.getOneContactUs),
		managerLog("contactUs read"),
		contactUsController.getOneContactUs,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("contactUs delete"),
		inputValidator(contactUsValidation.getOneContactUs),
		managerLog("contactUs delete"),
		contactUsController.deleteContactUs,
	);
router
	.route("/contact-us")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("contactUs read"),
		inputValidator(contactUsValidation.getAllContactUsByManager),
		managerLog("contactUs read"),
		contactUsController.getAllContactUs,
	);

// Subscribe
router
	.route("/subscribes/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("emailSubscribe read"),
		managerLog("emailSubscribe read"),
		inputValidator(subscribeValidation.getOneSubscribe),
		subscribeController.getOneSubscribe,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("emailSubscribe delete"),
		managerLog("emailSubscribe delete"),
		inputValidator(subscribeValidation.getOneSubscribe),
		subscribeController.deleteSubscribe,
	);
//todo
router
	.route("/subscribes")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("emailSubscribe read"),
		managerLog("emailSubscribe read"),
		inputValidator(subscribeValidation.getAllSubscribesByManager),
		subscribeController.getAllSubscribe,
	);

// Game (competition)
router
	.route("/competition")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		managerLog("competition read"),
		inputValidator(competitionValidation.getCompetitions),
		competitionController.getCompetitions,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition create"),
		managerLog("competition create"),
		inputValidator(competitionValidation.addCompetition),
		competitionController.addCompetition,
	);

router
	.route("/competition/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		managerLog("competition read"),
		inputValidator(competitionValidation.getCompetition),
		competitionController.getCompetition,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition update"),
		managerLog("competition update"),
		inputValidator(competitionValidation.editCompetition),
		competitionController.editCompetition,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition delete"),
		managerLog("competition delete"),
		inputValidator(competitionValidation.deleteCompetition),
		competitionController.deleteCompetition,
	);

router
	.route("/count_competition_participant")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		inputValidator(competitionValidation.countCompetitionParticipant),
		managerLog("competition read"),
		competitionController.countCompetitionParticipant,
	);
router
	.route("/competition_rank")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		inputValidator(competitionValidation.competitionRank),
		managerLog("competition read"),
		competitionController.competitionRank,
	);

// Game (Task)
router
	.route("/task")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		managerLog("competition read"),
		inputValidator(competitionValidation.getTasks),
		competitionController.getTasks,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition create"),
		managerLog("competition create"),
		competitionUpload.fields([{ name: "image", maxCount: 1 }]),
		inputValidator(competitionValidation.addTask),
		competitionController.addTask,
	);

router
	.route("/task/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		managerLog("competition read"),
		inputValidator(competitionValidation.getTask),
		competitionController.getTask,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition update"),
		managerLog("competition update"),
		competitionUpload.fields([{ name: "image", maxCount: 1 }]),
		inputValidator(competitionValidation.editTask),
		competitionController.editTask,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition delete"),
		managerLog("competition delete"),
		inputValidator(competitionValidation.delTask),
		competitionController.deleteTask,
	);

//diamond
router
	.route("/diamond")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("Diamond read"),
		managerLog("Diamond read"),
		inputValidator(diamondValidation.getDiamonds),
		diamondController.getDiamonds,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("Diamond create"),
		managerLog("Diamond create"),
		diamondUpload.fields([{ name: "image", maxCount: 1 }]),
		inputValidator(diamondValidation.addDiamond),
		diamondController.addDiamond,
	);
router
	.route("/diamond/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("Diamond read"),
		managerLog("Diamond read"),
		inputValidator(diamondValidation.getDiamond),
		diamondController.getDiamond,
	);

router
	.route("/auction-diamond")
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition create"),
		managerLog("competition create"),
		inputValidator(diamondValidation.addAuctionDiamond),
		diamondController.addAuctionDiamonds,
	)
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		managerLog("competition read"),
		inputValidator(diamondValidation.getDiamondTypesByManager),
		diamondController.getAuctionDiamondsByManager,
	);

router
	.route("/auction-diamond/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		managerLog("competition read"),
		inputValidator(diamondValidation.getDiamondTypeByManager),
		diamondController.getAuctionDiamondByManager,
	);

router
	.route("/diamond-type")
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("Diamond create"),
		managerLog("Diamond create"),
		diamondTypeUpload.fields([{ name: "image", maxCount: 1 }]),
		inputValidator(diamondTypeValidation.addDiamondType),
		diamondTypeController.addDiamondType,
	)

	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("Diamond read"),
		managerLog("Diamond read"),
		inputValidator(diamondTypeValidation.getDiamondTypesByManager),
		diamondTypeController.getDiamondTypesByManager,
	);

router
	.route("/diamond-type/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("Diamond read"),
		managerLog("Diamond read"),
		inputValidator(diamondTypeValidation.getDiamondTypeByManager),
		diamondTypeController.getDiamondTypeByManager,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("Diamond update"),
		managerLog("Diamond update"),
		diamondTypeUpload.fields([{ name: "image", maxCount: 1 }]),
		inputValidator(diamondTypeValidation.editDiamondType),
		diamondTypeController.editDiamondType,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("Diamond delete"),
		managerLog("Diamond delete"),
		inputValidator(diamondTypeValidation.deleteDiamondType),
		diamondTypeController.deleteDiamondType,
	);

router
	.route("/submitted-task")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		inputValidator(competitionValidation.getMatchParticipant),
		managerLog("competition read"),
		competitionController.getMatchParticipant,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("competition read"),
		inputValidator(competitionValidation.updateMatchParticipant),
		managerLog("competition read"),
		competitionController.updateMatchParticipant,
	);

router
	.route("/prize")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("prize read"),
		inputValidator(prizeValidation.getPrizes),
		managerLog("prize read"),
		prizeController.getPrizes,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("prize create"),
		inputValidator(prizeValidation.addPrize),
		managerLog("prize create"),
		prizeController.addPrize,
	);

router
	.route("/prize/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("prize read"),
		inputValidator(prizeValidation.getPrize),
		managerLog("prize read"),
		prizeController.getPrize,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("prize update"),
		inputValidator(prizeValidation.editPrize),
		managerLog("prize update"),
		prizeController.editPrize,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("prize delete"),
		inputValidator(prizeValidation.delPrize),
		managerLog("prize delete"),
		prizeController.deletePrize,
	);

router
	.route("/asset")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("asset read"),
		managerLog("asset read"),
		assetController.getAssets,
	);

router
	.route("/asset/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("asset read"),
		inputValidator(assetValidation.getAssetSingle),
		managerLog("asset read"),
		assetController.getAssetSingle,
	);

router
	.route("/assetNetwork")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("assetNetwork read"),
		inputValidator(assetNetworkValidation.assetNetwork),
		managerLog("assetNetwork read"),
		assetNetworkController.assetNetwork,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("assetNetwork create"),
		inputValidator(assetNetworkValidation.addAssetNetwork),
		managerLog("assetNetwork create"),
		assetNetworkController.addAssetNetwork,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("assetNetwork update"),
		inputValidator(assetNetworkValidation.editAssetNetwork),
		managerLog("assetNetwork update"),
		assetNetworkController.editAssetNetwork,
	);

// router
//     .route("/assetNetwork/selector")
//     .get(
//         authMiddleware.managerAuthMiddleware,
//         // permissionMiddleware("assetNetwork read"),
//         inputValidator(assetNetworkValidation.assetNetworkSelector),
//         // managerLog("assetNetwork read"),
//         assetNetworkController.assetNetworkSelector,
//     );

router
	.route("/assetNetwork/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("assetNetwork read"),
		inputValidator(assetNetworkValidation.findById),
		managerLog("assetNetwork read"),
		assetNetworkController.findById,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("assetNetwork delete"),
		inputValidator(assetNetworkValidation.findById),
		managerLog("assetNetwork delete"),
		assetNetworkController.deleteAssetNetwork,
	);

router
	.route("/network")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("network read"),
		inputValidator(assetNetworkValidation.getNetwork),
		managerLog("network read"),
		assetNetworkController.getNetwork,
	);

router
	.route("/auction-trades")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("auction read"),
		inputValidator(auctionValidation.getAuctionTradesManager),
		managerLog("auction read"),
		auctionController.getAuctionTradesManager,
	);
router
	.route("/auction-trades/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("auction read"),
		inputValidator(auctionValidation.getAuctionTradeManager),
		managerLog("auction read"),
		auctionController.getAuctionTradeManager,
	);

router
	.route("/transactions")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("transaction read"),
		inputValidator(financialValidation.getTransactions),
		managerLog("transaction read"),
		financialController.getAllTransactionByManager,
	);

router
	.route("/transaction")
	.patch(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("transaction update"),
		inputValidator(financialValidation.getTransactions),
		managerLog("transaction update"),
		financialController.updateTransactionByManager,
	);

router
	.route("/transaction/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("transaction read"),
		inputValidator(financialValidation.getById),
		managerLog("transaction read"),
		financialController.getById,
	);
router
	.route("/swap-transaction")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("swap read"),
		inputValidator(swapValidation.getAllSwapTransactionByManager),
		managerLog("swap read"),
		swapController.getAllSwapTransactionByManager,
	);

// router
// 	.route("/swap-transaction/:id")
// 	.get(
// 		authMiddleware.managerAuthMiddleware,
// 		permissionMiddleware("swap read"),
// 		inputValidator(swapValidation.getSwapTransactionByManager),
// 		swapController.getSwapTransactionByManager,
// 	);

router
	.route("/ticket")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("ticket read"),
		inputValidator(ticketValidation.managerGetTickets),
		managerLog("ticket read"),
		ticketController.managerGetTickets,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("ticket create"),
		inputValidator(ticketValidation.managerAddTicket),
		ticketUpload.fields([{ name: "files", maxCount: 5 }]),
		managerLog("ticket create"),
		ticketController.managerAddTicket,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("ticket update"),
		ticketUpload.fields([{ name: "files", maxCount: 5 }]),
		inputValidator(ticketValidation.managerEditTicket),
		managerLog("ticket update"),
		ticketController.managerEditTicket,
	);

//single

router
	.route("/ticket/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("ticket read"),
		inputValidator(ticketValidation.managerGetTicket),
		managerLog("ticket read"),
		ticketController.managerGetTicket,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("ticket delete"),
		inputValidator(ticketValidation.managerDeleteTicket),
		managerLog("ticket delete"),
		ticketController.managerDeleteTicket,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("ticket update"),
		inputValidator(ticketValidation.managerChangeTicketStatus),
		managerLog("ticket update"),
		ticketController.managerChangeTicketStatus,
	)
	.patch(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("ticket update"),
		inputValidator(ticketValidation.managerAcceptTicket),
		managerLog("ticket update"),
		ticketController.managerAcceptTicket,
	);

router
	.route("/ticket/department/:id")
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("ticket update"),
		inputValidator(ticketValidation.managerChangeTicketDepartment),
		managerLog("ticket update"),
		ticketController.managerChangeTicketDepartment,
	);
///// ticket template ////

router
	.route("/reply/template")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply read"),
		inputValidator(ticketValidation.managerGetReplyTemplates),
		managerLog("reply read"),
		ticketController.managerGetReplyTemplates,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply create"),
		inputValidator(ticketValidation.managerAddReplyTemplate),
		managerLog("reply create"),
		ticketController.managerAddReplyTemplate,
	);

router
	.route("/reply/template/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply read"),
		inputValidator(ticketValidation.managerGetReplyTemplateById),
		managerLog("reply read"),
		ticketController.managerGetReplyTemplateById,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply delete"),
		inputValidator(ticketValidation.managerDeleteReplyTemplate),
		managerLog("reply delete"),
		ticketController.managerDeleteReplyTemplate,
	);

router
	.route("/reply")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply read"),
		inputValidator(ticketValidation.managerGetReplies),
		managerLog("reply read"),
		ticketController.managerGetReplies,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		ticketUpload.fields([{ name: "files", maxCount: 5 }]),
		permissionMiddleware("reply create"),
		inputValidator(ticketValidation.managerAddReply),
		managerLog("reply create"),
		ticketController.managerAddReply,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply update"),
		ticketUpload.fields([{ name: "files", maxCount: 5 }]),
		inputValidator(ticketValidation.managerEditReply),
		managerLog("reply update"),
		ticketController.managerEditReply,
	);

////single

router
	.route("/reply/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply read"),
		inputValidator(ticketValidation.managerGetReply),
		managerLog("reply read"),
		ticketController.managerGetReply,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply delete"),
		inputValidator(ticketValidation.managerDeleteReply),
		managerLog("reply delete"),
		ticketController.managerDeleteReply,
	);

router
	.route("/reply/approve/:id")
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("reply update"),
		inputValidator(ticketValidation.managerApproveReply),
		managerLog("reply update"),
		ticketController.managerApproveReply,
	);
////////Department//////////////////

router
	.route("/department")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("department update"),
		inputValidator(departmentValidation.getDepartments),
		managerLog("department update"),
		departmentController.getDepartments,
	)
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("department update"),
		inputValidator(departmentValidation.addDepartment),
		managerLog("department update"),
		departmentController.addDepartment,
	)
	.put(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("department update"),
		inputValidator(departmentValidation.editDepartment),
		managerLog("department update"),
		departmentController.editDepartment,
	);

//selctor
router
	.route("/department/selector")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("department update"),
		inputValidator(departmentValidation.departmentSelector),
		managerLog("department update"),
		departmentController.departmentSelector,
	);

//single

router
	.route("/department/:id")
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("department update"),
		inputValidator(departmentValidation.getDepartment),
		managerLog("department update"),
		departmentController.getDepartment,
	)
	.delete(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("department update"),
		inputValidator(departmentValidation.deleteDepartment),
		managerLog("department update"),
		departmentController.deleteDepartment,
	);

router
	.route("/assigned-card")
	.post(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("card create"),
		inputValidator(diamondValidation.createAssignedCard),
		managerLog("diamond create"),
		diamondController.createAssignedCard,
	)
	.get(
		authMiddleware.managerAuthMiddleware,
		permissionMiddleware("card read"),
		inputValidator(diamondValidation.getAssignedCard),
		managerLog("diamond read"),
		diamondController.getAssignedCard,
	);

module.exports = router;

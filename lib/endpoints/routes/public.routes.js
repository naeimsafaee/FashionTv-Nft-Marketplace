const {
	blogController,
	categoryController,
	userTokenController,
	customController,
	auctionController,
	userCollectionController,
	auctionOfferController,
	userController,
	settingController,
	brandController,
	activityController,
	contactUsController,
	subscribeController,
	eventController,
	competitionController,
	diamondTypeController,
	prizeController
} = require("./../controllers");
const {
	categoryValidation,
	blogValidation,
	userTokenValidation,
	customValidation,
	auctionValidation,
	userCollectionValidation,
	auctionOfferValidation,
	userValidation,
	settingValidation,
	brandValidation,
	activityValidation,
	contactUsValidation,
	subscribeValidation,
	eventValidation,
	competitionValidation,
	diamondTypeValidation,
	prizeValidation
} = require("./../validations");

const { signatureUploader } = require("./../../middlewares/nftUploader");
const { eventImageUpload } = require("./../../middlewares/s3Uploader");

const { inputValidator, authMiddleware } = require("./../../middlewares");
const { recaptchaMiddleware } = require("../../middlewares/recaptchaMiddleware");
const { diamondValidation } = require("../validations");
const { diamondController } = require("../controllers");
const { getAllCurrency } = require("../controllers/Financial/CurrencyController");

const router = require("express").Router();

router.route("/currencies").get(getAllCurrency);

router.route("/send_notif").post(inputValidator(userValidation.sendUserNotif), userController.sendUserNotif);

router.route("/category").get(inputValidator(categoryValidation.getCategories), categoryController.getCategories);
router
	.route("/category/selector")
	.get(inputValidator(categoryValidation.categorySelector), categoryController.categorySelector);
router.route("/category/:id").get(inputValidator(categoryValidation.getCategory), categoryController.getCategory);

router.route("/blog").get(inputValidator(blogValidation.getBlogs), blogController.getBlogs);
router.route("/blog/recommended").get(inputValidator(blogValidation.getBlogs), blogController.recommendedBlogs);
router.route("/blog/selector").get(inputValidator(blogValidation.blogSelector), blogController.blogSelector);
// router.route("/blog/relatedBlogs").get(inputValidator(blogValidation.relatedBlogs), blogController.relatedBlogs);
router
	.route("/blog/categories")
	.get(inputValidator(blogValidation.getBlogCategories), blogController.getBlogCategories);
router.route("/blog/:slug").get(inputValidator(blogValidation.getBlog), blogController.getBlog);

// User Collection
router
	.route("/collection")
	.get(inputValidator(userCollectionValidation.getUserCollections), userCollectionController.getUserCollections);
router
	.route("/collection/selector")
	.get(
		inputValidator(userCollectionValidation.userCollectionSelector),
		userCollectionController.userCollectionSelector,
	);

router
	.route("/collection/custom")
	.get(inputValidator(userCollectionValidation.userCollectionSelector), userCollectionController.customCollection);

router
	.route("/collection/:id")
	.get(
		authMiddleware.customAuthMiddleware,
		inputValidator(userCollectionValidation.getUserCollection),
		userCollectionController.getUserCollection,
	);

// User Tokens
// router.route("/token").get(inputValidator(userTokenValidation.getUserTokens), userTokenController.getTokens);
router
	.route("/token")
	.get(
		authMiddleware.customAuthMiddleware,
		inputValidator(customValidation.customExplore),
		customController.customExplorer,
	);

// router
// 	.route("/token/selector")
// 	.get(inputValidator(userTokenValidation.userTokenSelector), userTokenController.tokenSelector);
router
	.route("/token/:id")
	.get(
		authMiddleware.customAuthMiddleware,
		inputValidator(userTokenValidation.getUserToken),
		userTokenController.getToken,
	);

router.route("/search-username").get(inputValidator(customValidation.searchUsername), customController.searchUsername);

router.route("/auction").get(inputValidator(auctionValidation.getAllAuction), auctionController.getAllAuction);
router
	.route("/auction/selector")
	.get(inputValidator(auctionValidation.auctionSelector), auctionController.auctionSelector);
router.route("/auction/:id").get(inputValidator(auctionValidation.getOneAuction), auctionController.getOneAuction);

router
	.route("/auction-offer/selector")
	.get(inputValidator(auctionOfferValidation.auctionOfferSelector), auctionOfferController.auctionSelectorOffer);
router
	.route("/auction-offer/:id")
	.get(inputValidator(auctionOfferValidation.getOneAuctionOffer), auctionOfferController.getOneAuctionOffer);

// General Search
router.route("/general-search").get(inputValidator(customValidation.generalSearch), customController.generalSearch);

// Explore
router.route("/explore").get(inputValidator(customValidation.explore), customController.explore);

// Top Sellers
router.route("/top-sellers").get(inputValidator(customValidation.topSellers), customController.topSellers);

// Popular Collections
router
	.route("/popular-collections")
	.get(inputValidator(customValidation.popularCollections), customController.popularCollections);

// Assets
router
	.route("/assets")
	.get(authMiddleware.customAuthMiddleware, inputValidator(customValidation.assets), customController.assets);

// Featured Users
router.route("/featured-users").get(inputValidator(customValidation.featuredUsers), customController.featuredUsers);

// Trending Arts
router.route("/trending-arts").get(inputValidator(customValidation.trendingArts), customController.trendingArts);

// Featured Collections
router
	.route("/featured-collections")
	.get(inputValidator(customValidation.featuredCollections), customController.featuredCollections);

// Collection
router
	.route("/collection-search")
	.get(
		authMiddleware.customAuthMiddleware,
		inputValidator(customValidation.collectionSearch),
		customController.collectionSearch,
	);

// Slider
router.route("/slider").get(inputValidator(customValidation.slider), customController.slider);

// User
router.route("/user/:id").get(inputValidator(userValidation.findUserById), userController.getUser);

router.route("/auction-fee").get(auctionController.getSettings);

router.route("/ranking").get(inputValidator(customValidation.ranking), customController.ranking);

router.route("/setting").get(inputValidator(settingValidation.getSetting), settingController.getSetting);
router.route("/settings").get(inputValidator(settingValidation.getSettings), settingController.getSettings);

router
	.route("/activity")
	.get(inputValidator(userCollectionValidation.userActivity), userCollectionController.userActivity);

router.route("/brands").get(inputValidator(brandValidation.getBrands), brandController.getBrands);
router.route("/brands/:id").get(inputValidator(brandValidation.getBrand), brandController.getBrand);

router.route("/socket-test").get(customController.socketTest);

router
	.route("/price-history")
	.get(inputValidator(activityValidation.getPriceHistory), activityController.getPriceHistory);
router.route("/gas-price").get(customController.gasPrice);

// Contact Us
router
	.route("/contact-us")
	.post(recaptchaMiddleware, inputValidator(contactUsValidation.addContactUs), contactUsController.addContactUs);

// Subscribe
router.route("/subscribe").post(inputValidator(subscribeValidation.addSubscribe), subscribeController.addSubscribe);

// Event
router
	.route("/event")
	.get(inputValidator(eventValidation.getEvents), eventController.getEvents)
	.post(signatureUploader, /* inputValidator(eventValidation.editEvent),*/ eventController.editEvent);

// router.route("/event").get(inputValidator(eventValidation.getEvent), eventController.getEvent);

router.route("/event/all/:code").get(inputValidator(eventValidation.getEventAll), eventController.getEventAll);
router.route("/event/single/:id").get(inputValidator(eventValidation.getEventSingle), eventController.getEventSingle);

router.route("/event-upload").post(eventImageUpload.array("event"), eventController.uploadEventPictures);

//marketplace

router
	.route("/auction-list")
	.get(inputValidator(diamondValidation.getAuctionDiamonds), diamondController.getAuctionDiamonds);

router
	.route("/diamond-type")
	.get(inputValidator(diamondTypeValidation.getDiamondTypesByManager), diamondTypeController.getDiamondTypes);

router
	.route("/user-diamond/:id")
	.get(inputValidator(diamondValidation.getDiamond), diamondController.getDiamondByUserDiamond);
// Calculator
router.route("/calculator").post(inputValidator(customValidation.calculator), customController.calculator);

router.route("/prize").get(inputValidator(prizeValidation.getPrizes), prizeController.getPrizes);


module.exports = router;

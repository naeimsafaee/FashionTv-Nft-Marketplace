const {authMiddleware, inputValidator} = require("./../../middlewares");
const {
    userValidation,
    userCollectionValidation,
    userTokenValidation,
    customValidation,
    auctionValidation,
    auctionOfferValidation,
    competitionValidation,
    purchaseValidation,
    ticketValidation,
    departmentValidation
} = require("./../validations");
const {
    userController,
    userCollectionController,
    userTokenController,
    customController,
    authController,
    auctionController,
    auctionOfferController,
    userFollowLikeController,
    competitionController,
    purchaseController,
    ticketController,
    departmentController
} = require("./../controllers");

const {
    avatarUpload,
    userCollectionImageUpload,
    NftImageUpload,
    ticketUpload,
    MainNftFileUpload,
} = require("./../../middlewares/s3Uploader");
const {uploadNftFile} = require("../../middlewares/nftUploader");
const {recaptchaMiddleware} = require("../../middlewares/recaptchaMiddleware");
const {diamondController} = require("../controllers");
const {diamondValidation} = require("../validations");

const router = require("express").Router();
router.route("/register").post(authController.userRegister);

router.route("/add_referred_code").post(
    inputValidator(userValidation.addReferralCode),
    authMiddleware.userAuthMiddleware,
    authController.addReferredCode);

router.route("/seen_ghost_modal").post(
    authMiddleware.userAuthMiddleware,
    authController.seenGhostModal);

router.route("/me").get(authMiddleware.userAuthMiddleware, authController.getUserInfo);

router.route("/wallet").get(authMiddleware.userAuthMiddleware, authController.getUserWallet);

router.route("/me").put(
    authMiddleware.userAuthMiddleware,
    avatarUpload.fields([
        {name: "background", maxCount: 1},
        {name: "image", maxCount: 1},
    ]),
    inputValidator(userValidation.editUsers),
    userController.editUsers,
);

router
    .route("/collection")
    .post(
        authMiddleware.userAuthMiddleware,
        userCollectionImageUpload.fields([
            {name: "image", maxCount: 1},
            {name: "background", maxCount: 1},
            {name: "featured", maxCount: 1},
        ]),
        inputValidator(userCollectionValidation.addUserCollection),
        userCollectionController.addUserCollection,
    )
    .get(inputValidator(userCollectionValidation.getUserCollections), userCollectionController.getUserCollections)
    .put(
        authMiddleware.userAuthMiddleware,
        userCollectionImageUpload.fields([
            {name: "image", maxCount: 1},
            {name: "background", maxCount: 1},
            {name: "featured", maxCount: 1},
        ]),
        inputValidator(userCollectionValidation.editUserCollection),
        userCollectionController.editUserCollection,
    );
router
    .route("/collection/:id")
    .get(inputValidator(userCollectionValidation.getUserCollection), userCollectionController.getUserCollection)
    .delete(
        authMiddleware.userAuthMiddleware,
        inputValidator(userCollectionValidation.getUserCollection),
        userCollectionController.deleteUserCollection,
    );

// User Token
router.route("/token").post(
    // recaptchaMiddleware,
    authMiddleware.userAuthMiddleware,
    uploadNftFile,
    // NftImageUpload,
    MainNftFileUpload,
    inputValidator(userTokenValidation.addUserToken),
    userTokenController.addToken,
);

router.route("/token/status").post(
    // recaptchaMiddleware,
    authMiddleware.userAuthMiddleware,
    inputValidator(userTokenValidation.updateUserToken),
    userTokenController.updateToken,
);

router
    .route("/search-username")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(customValidation.searchUsername),
        customController.searchUsername,
    );

router
    .route("/auction")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(auctionValidation.addAuction),
        auctionController.addAuction,
    );

router
    .route("/auction/:id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(auctionValidation.getOneAuction),
        auctionController.getAuction,
    )
    .delete(
        authMiddleware.userAuthMiddleware,
        inputValidator(auctionValidation.getOneAuction),
        auctionController.deleteAuction,
    );

// Auction Offer
router
    .route("/auction-offer")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(auctionOfferValidation.addAuctionOffer),
        auctionOfferController.addAuctionOffer,
    );

router
    .route("/auction-offer/:id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(auctionOfferValidation.getOneAuctionOffer),
        auctionOfferController.getOneAuctionOffer,
    )
    .delete(
        authMiddleware.userAuthMiddleware,
        inputValidator(auctionOfferValidation.getOneAuctionOffer),
        auctionOfferController.deleteAuctionOffer,
    );

// Follow
router
    .route("/follow")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(userValidation.userFollowUnfollow),
        userFollowLikeController.followUser,
    );

router
    .route("/unfollow")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(userValidation.userFollowUnfollow),
        userFollowLikeController.unFollowUser,
    );

router
    .route("/followers")
    .get(inputValidator(userValidation.getUserFollowing), userFollowLikeController.getUserFollowers);
router
    .route("/following")
    .get(inputValidator(userValidation.getUserFollowing), userFollowLikeController.getUserFollowing);
// Favorites
router
    .route("/favorites/token/like")
    .post(
        authMiddleware.customAuthMiddleware,
        inputValidator(userTokenValidation.likeUnlikeToken),
        userFollowLikeController.likeToken,
    );

router
    .route("/favorites/token/unlike")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(userTokenValidation.likeUnlikeToken),
        userFollowLikeController.unLikeToken,
    );

router
    .route("/favorites/collection/like")
    .post(
        authMiddleware.customAuthMiddleware,
        inputValidator(userCollectionValidation.likeUnlikeCollection),
        userFollowLikeController.likeCollection,
    );

router
    .route("/favorites/collection/unlike")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(userCollectionValidation.likeUnlikeCollection),
        userFollowLikeController.unLikeCollection,
    );

router
    .route("/favorites/token")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(userValidation.getUserFavouriteToken),
        userFollowLikeController.getUserFavoriteToken,
    );

router
    .route("/favorites/collection")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(userValidation.getUserFavouriteToken),
        userFollowLikeController.getUserFavoriteCollection,
    );

router.route("/diamonds").get(
    // authMiddleware.userAuthMiddleware,
    inputValidator(userTokenValidation.userDiamond),
    userTokenController.userDiamonds,
);

router
    .route("/tabs-info")
    .get(authMiddleware.userAuthMiddleware, inputValidator(customValidation.tabsInfo), userController.tabsInfo);

router
    .route("/me/offers")
    .get(
        inputValidator(auctionOfferValidation.getUserOffers),
        authMiddleware.userAuthMiddleware,
        auctionOfferController.getUserOffers,
    );

router
    .route("/me/offers-others")
    .get(
        inputValidator(auctionOfferValidation.getUserOffers),
        authMiddleware.userAuthMiddleware,
        auctionOfferController.getUserOffersOthers,
    );

router
    .route("/me/token/pending")
    .get(
        inputValidator(userTokenValidation.getUserPendingTokens),
        authMiddleware.userAuthMiddleware,
        userTokenController.getUserPendingTokens,
    );

router
    .route("/me/token/unblockable-content/:id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(userTokenValidation.getTokenUnblockableContent),
        userTokenController.getTokenUnblockableContent,
    );

router.route("/me/token/count").get(authMiddleware.userAuthMiddleware, userTokenController.getTokensCount);

router
    .route("/token/import")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(userTokenValidation.importToken),
        userTokenController.importToken,
    );

//competition
router.route("/competition").get(
    // authMiddleware.userAuthMiddleware,
    inputValidator(competitionValidation.getCompetitions),
    competitionController.getCompetitions,
);

router
    .route("/competition/:id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(competitionValidation.getCompetitions),
        competitionController.getCompetitionByUser,
    );

router
    .route("/task")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(competitionValidation.getTaskByUser),
        competitionController.getTaskByUser,
    );

router.route("/task/participate").post(
    authMiddleware.userAuthMiddleware,
    // uploadNftFile,
    // NftImageUpload,
    // MainNftFileUpload,
    inputValidator(competitionValidation.participateTask),
    competitionController.participateTask,
);

router
    .route("/diamond/purchase")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(purchaseValidation.purchaseDiamond),
        purchaseController.purchaseDiamond,
    );

router
    .route("/prize/:id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(competitionValidation.getPrizeCompetition),
        competitionController.getPrizeCompetition,
    );

router
    .route("/leaderboards")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(competitionValidation.getLeaderboards),
        competitionController.getLeaderboards,
    );

router
    .route("/notifications")
    .get(authMiddleware.userAuthMiddleware, inputValidator(userValidation.notification), userController.notification)

    // .post(
    //     authMiddleware.userAuthMiddleware,
    //     inputValidator(userValidation.updateNotification),
    //     userController.updateNotification,
    // );

    .post(
        authMiddleware.userAuthMiddleware,
        // inputValidator(userValidation.updateNotification),
        userController.readAllNotification,
    );

router
    .route("/notifications/:notification_id?")
    .patch(authMiddleware.userAuthMiddleware, userController.notificationStatus);

router
    .route("/read_notifications")
    .post(
        authMiddleware.userAuthMiddleware,
        inputValidator(userValidation.readNotification),
        userController.readNotification,
    );

router
    .route("/match-participant/score/:participant_team_id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(competitionValidation.getScoreMatchParticipant),
        competitionController.getScoreMatchParticipant,
    );

router
    .route("/user-diamond/:id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(diamondValidation.getDiamond),
        diamondController.getDiamondByUserDiamondId,
    );

///////////////////////// Ticket ///////////////////////////

router
    .route("/ticket")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(ticketValidation.userGetTickets),
        ticketController.userGetTickets,
    )
    .post(
        authMiddleware.userAuthMiddleware,
        ticketUpload.fields([{name: "files", maxCount: 5}]),
        inputValidator(ticketValidation.userAddTicket),
        ticketController.userAddTicket,
    );

///signle

router
    .route("/ticket/:id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(ticketValidation.userGetTicket),
        ticketController.userGetTicket,
    );

//reply

router
    .route("/reply")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(ticketValidation.userGetReplies),
        ticketController.userGetReplies,
    )
    .post(
        authMiddleware.userAuthMiddleware,
        ticketUpload.fields([{name: "files", maxCount: 5}]),
        inputValidator(ticketValidation.userAddReply),
        ticketController.userAddReply,
    );

//single reply

router
    .route("/reply/:id")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(ticketValidation.userGetReply),
        ticketController.userGetReply,
    );

//////department

router
    .route("/department/selector")
    .get(
        authMiddleware.userAuthMiddleware,
        inputValidator(departmentValidation.departmentSelector),
        departmentController.departmentSelector,
    );

router.route("/links/go/:code").get(
    // recaptcha.recaptchaMiddleware,
    inputValidator(userValidation.inviteLink),
    userController.inviteLinkHandler,
);

router.route("/referral").get(authMiddleware.userAuthMiddleware, userController.referral);

router
    .route("/referral/history")
    .get(authMiddleware.userAuthMiddleware, inputValidator(userValidation.getReferral), userController.referralHistory);
module.exports = router;

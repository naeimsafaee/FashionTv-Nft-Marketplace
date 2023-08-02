const {phone} = require("phone");
const {
    Manager,
    User,
    ManagerSession,
    UserDiamond,
    DiamondType,
    Diamond,
    Asset,
    UserWallet,
    UserNotification,
    UserCollection,
    Category,
    Role,
    Permission,
    ManagerNotification,
    ReferralReward
} = require("../../databases/mongodb");
const uuid = require("uuid");

const {HumanError, NotFoundError, NotAuthenticatedError, InvalidRequestError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {password, jwt} = require("../../utils");
const Web3Token = require("web3-token");
const Web3 = require("web3");
const moment = require("moment");

function throwError() {
    throw new NotAuthenticatedError(Errors.UNAUTHORIZED.CODE, Errors.UNAUTHORIZED.MESSAGE);
}

function emptyAddress() {
    throw new InvalidRequestError(Errors.EMPTY_ADDRESS.CODE, Errors.EMPTY_ADDRESS.MESSAGE);
}

function invalidAddress() {
    throw new InvalidRequestError(Errors.INVALID_ADDRESS.CODE, Errors.INVALID_ADDRESS.MESSAGE);
}

async function managerLogin(email, _password) {
    return new Promise(async (resolve, reject) => {
        const findObject = {};
        email = email.toLowerCase();
        findObject.email = email;
        const user = await Manager.findOne(findObject);
        if (!user)
            return reject(new NotFoundError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE, findObject));

        const checkPassword = await password.validate(_password, user.salt, user.password);
        if (!checkPassword && findObject.email)
            return reject(
                new HumanError(Errors.EMAIL_AND_PASSWORD_INCORRECT.MESSAGE, Errors.EMAIL_AND_PASSWORD_INCORRECT.CODE),
            );

        // generate user auth token
        const _token = new jwt.Token(user.id, "manager");

        const refreshToken = _token.generateRefresh();

        const accessToken = _token.generateAccess();

        await ManagerSession.create({
            manager: user.id,
            accessToken,
            refreshToken,
            accessExpiresAt: _token.accessExpiresAt,
            refreshExpiresAt: _token.refreshExpiresAt,
        });

        resolve({
            refreshToken: {
                token: refreshToken,
                expiresAt: _token.refreshExpiresAt,
            },
            accessToken: {
                token: accessToken,
                expiresAt: _token.accessExpiresAt,
            },
        });
    });
}

async function userRegister(req, io) {
    const address = req.body.address.toLowerCase();
    const referredCode = req.body?.referredCode;

    if (!address) {
        return emptyAddress();
    }

    const isAddressValid = Web3.utils.isAddress(address);
    if (!isAddressValid) {
        return invalidAddress();
    }
    let isRegister = false;
    let user = await User.findOne({address});
    if (!user) {
        isRegister = true;
        let referralCode = uuid.v4()?.split("-")?.shift();
        user = await User.create({address, referralCode});
        let assets = await Asset.find({
            $or: [{title: "VIO_SYSTEM"}, {title: "BUSD_SYSTEM"}, {title: "BNB_SYSTEM"}],
        });
        await Promise.all(
            assets.map(async (asset) => {
                await UserWallet.create({
                    userId: user._id,
                    assetId: asset._id,
                    amount: 0,
                    frozen: 0,
                    pending: 0,
                });
            }),
        );

        let title = `New User ${user.address.slice(0, 8)}...${user.address.slice(-8)} is registered in the FTV.`;
        let notif = await ManagerNotification.create({title: title});
        io.to(`Manager`).emit("notification", JSON.stringify(notif));
    }

    const collections = await UserCollection.countDocuments({user: user._id, deletedAt: null});
    if (collections === 0) {
        const category = await Category.findOne({title: "Art"});
        const result = await UserCollection.create({
            user: user._id,
            name: "competition_" + user.address.slice(-4),
            description: "this is a collection for competition's task",
            category: category._id,
            image: [
                {
                    name: "abe27f8c-3dad-4fb6-8115-4b4224d0df6d.png",
                    key: "collection/images/abe27f8c-3dad-4fb6-8115-4b4224d0df6d.png",
                    location:
                        "https://ftvio.s3.amazonaws.com/collection/images/abe27f8c-3dad-4fb6-8115-4b4224d0df6d.png",
                },
            ],
            featured: [
                {
                    name: "c6e91048-0f41-4dd7-ba7d-b66ad6caf134.blob",
                    key: "collection/images/c6e91048-0f41-4dd7-ba7d-b66ad6caf134.blob",
                    location:
                        "https://ftvio.s3.amazonaws.com/collection/images/abe27f8c-3dad-4fb6-8115-4b4224d0df6d.png",
                },
            ],
        });
    }

    // let GhostMode = await assignGhostCard(user);
    user = await User.findOne({address}).lean();
    user.isRegister = isRegister;

    if (referredCode) {
        const referredUser = await User.findOne({referralCode: referredCode});

        if (!referredUser) throw new HumanError("There is no user with current referred code.", 400);

        if (referredUser.level === "NORMAL") {
            const userCount = await User.countDocuments({referredCode});

            if (userCount >= referredUser.referralCodeCount) {
                throw new HumanError(
                    `This referral code already reaches it's maximum allowed usage number (${referredUser.referralCodeCount})`,
                    400,
                );
            }
        }
        user.referredCode = referredCode;
        user.seenReferredModal = true;
        await user.save();
    }

    return user;
}

async function assignGhostCard(user) {
    let data = {
        isGhostModeEnabledNow: false,
        isGhostModeActive: false,
        isGhostModeLostNow: false,
        ghostExpiryDate: null,
        ghostDiamond: null,
    };

    const GhostType = await DiamondType.findOne({name: "Common"});

    if (GhostType) {
        const userCards = await UserDiamond.find({userId: user._id}).lean();

        if (userCards.length === 0) {
            //user has no card
            const freeGhostCard = await Diamond.findOne({diamondTypeId: GhostType._id});
            if (freeGhostCard) {
                // const transaction = await postgres.sequelize.transaction();

                try {
                    await UserDiamond.create({
                        userId: user._id,
                        diamondId: freeGhostCard._id,
                        status: "GIFT",
                    });

                    await UserNotification.create({
                        userId: user._id,
                        title: `Gift`,
                        description: `Congratulations! You have earn one common diamond as a gift `,
                    });
                    // await assignAttributes(user.id, freeGhostCard, transaction);

                    // await transaction.commit();
                    data.isGhostModeEnabledNow = true;

                } catch (e) {
                    // await transaction.rollback();
                    throw e;
                }
            }
        }

        const userGhostCards = await UserDiamond.findOne({
            userId: user._id,
            status: "GIFT",
            deletedAt: null,
        }).populate({path: "diamondId", match: {diamondTypeId: GhostType._id}});

        data.ghostDiamond = userGhostCards;

        if (userGhostCards && userGhostCards.diamondId) {
            const userNormalCards = await UserDiamond.find({
                userId: user._id,
            }).populate({path: "diamondId", match: {diamondTypeId: {$ne: GhostType._id}}});

            let userNormalCard = 0;
            for (let i = 0; i < userNormalCards.length; i++) {
                if (userNormalCards[i].diamondId) userNormalCard += 1;
            }

            let ghostExpiryDate = moment(userGhostCards.createdAt, "YYYY-MM-DD").add(20, "days");
            data.ghostExpiryDate = ghostExpiryDate.unix();

            if (ghostExpiryDate.isBefore() || userNormalCard > 0) {
                userGhostCards.deletedAt = new Date();
                await userGhostCards.save();
                data.isGhostModeLostNow = true;
            } else {
                data.isGhostModeActive = true;
            }
        }
    }

    return data;
}

async function addReferredCode(userId, data) {
    const {referredCode} = data;
    const user = await User.findOne({_id: userId});

    if (!user) throw new NotFoundError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE);

    if (user.referredCode)
        throw new NotFoundError('you have already entered another code', 400);

    if (user.referralCode === referredCode)
        throw new NotFoundError('you can not use your own code', 400);

    if (referredCode) {
        const referredUser = await User.findOne({referralCode: referredCode});

        if (!referredUser) throw new HumanError("There is no user with current referred code.", 400);

        if (referredUser.level === "NORMAL") {
            const userCount = await User.countDocuments({referredCode});

            if (userCount >= referredUser.referralCodeCount) {
                throw new HumanError(
                    `This referral code already reaches it's maximum allowed usage number (${referredUser.referralCodeCount})`,
                    400,
                );
            }
        }
        user.referredCode = referredCode;
        user.seenReferredModal = true;
        await user.save();

        const bnbAsset = await Asset.findOne({title: "BNB_SYSTEM"});
        await ReferralReward.create({
            assetId: bnbAsset._id,
            type: 'REGISTER',
            amount: 0,
            userId: referredUser._id,
            referredUserId: user._id,
        })
    }

    return "success";
}

async function seenGhostModal(user) {
    await User.findOneAndUpdate(
        {_id: user._id,},
        {$set: {seenGhostModal: true}},
    );
    return "success";
}

async function managerInfo(userId) {
    const user = await Manager.findOne({_id: userId})
        .populate({
            path: "roleId",
            select: "name nickName",
            populate: {path: "permissions", select: "name nickName"},
        })
        .select("email avatar roleId status isSuperadmin");

    return {data: user};
}

module.exports = {
    managerLogin,
    userRegister,
    assignGhostCard,
    managerInfo,
    addReferredCode,
    seenGhostModal
};

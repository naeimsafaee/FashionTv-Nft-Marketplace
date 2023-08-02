const {NotFoundError, HumanError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {User, UserFollowLike} = require("../../databases/mongodb");
const {serializeUsers, serializeLikes, serializeCollections} = require("../../utils/serializer/user.serializer");

async function followUser(address, reqUser) {
    return new Promise(async (resolve, reject) => {
        let user = await User.findOne({address: address}, "_id");

        if (!user)
            return reject(
                new NotFoundError(Errors.ADDRESS_DOSE_NOT_EXIST.MESSAGE, Errors.ADDRESS_DOSE_NOT_EXIST.CODE, {
                    address,
                }),
            );
        let responce = await UserFollowLike.gotFollowed(user._id, reqUser);
        const reqUserModel = await User.findById(reqUser);
        if (responce.ok && responce.nModified !== 0) {
            await reqUserModel.follow(user._id);
        }

        return resolve(responce);
    });
}

async function unFollowUser(address, reqUser) {
    return new Promise(async (resolve, reject) => {
        let user = await User.findOne({address: address}, "_id");
        if (!user)
            return reject(
                new NotFoundError(Errors.ADDRESS_DOSE_NOT_EXIST.MESSAGE, Errors.ADDRESS_DOSE_NOT_EXIST.CODE, {
                    address,
                }),
            );
        let responce = await UserFollowLike.gotUnfollowed(user._id, reqUser);

        const reqUserModel = await User.findById(reqUser);
        await reqUserModel.unfollow(user._id);
        // if (responce.ok && responce.nModified !== 0)
        // else
        // 	return reject(
        // 		new NotFoundError(Errors.USER_FOLLOW_RESPONSE_NOT_OK.MESSAGE, Errors.USER_FOLLOW_RESPONSE_NOT_OK.CODE, {
        // 			id,
        // 		}),
        // 	);
        return resolve(responce);
    });
}

async function likeToken(tokenId, userId, ip) {
    return new Promise(async (resolve, reject) => {

        let responce = await UserFollowLike.tokenLiked(userId, {tokenId}, ip);
        resolve(responce);
    });
}

async function unLikeToken(tokenId, userId) {
    return new Promise(async (resolve, reject) => {
        let responce = await UserFollowLike.tokenUnliked(userId, {tokenId});
        resolve(responce);
    });
}

async function likeCollection(collectionId, userId, ip) {
    return new Promise(async (resolve, reject) => {
        let response = await UserFollowLike.collectionLiked(userId, {collectionId}, ip);
        resolve(response);
    });
}

async function unLikeCollection(collectionId, userId) {
    return new Promise(async (resolve, reject) => {
        let responce = await UserFollowLike.collectionUnliked(userId, {collectionId});
        resolve(responce);
    });
}

async function getUserFollowers(page, limit, address) {
    return new Promise(async (resolve, reject) => {

        let user = await User.findOne({address: address}, "_id");

        if (!user)
            return reject(
                new NotFoundError(Errors.ADDRESS_DOSE_NOT_EXIST.MESSAGE, Errors.ADDRESS_DOSE_NOT_EXIST.CODE, {
                    address,
                }),
            );

        let response = await UserFollowLike.findOne(
            {userId: user._id},
            {
                followersIds: {
                    $slice: [limit * (page - 1), limit],
                },
            },
        ).populate("followersIds");

        let responseTotal = await UserFollowLike.aggregate([
            {$match: {userId: user._id}},
            {$unwind: "$followersIds"},
            {$group: {_id: "$_id", sum: {$sum: 1}}},
            {$group: {_id: null, total_sum: {$sum: "$sum"}}},
        ]);

        if (!response)
            resolve({
                total: 0,
                pageSize: limit,
                page,
                data: [],
            });

        if (!response?.followersIds || response?.followersIds.length === 0) {
            resolve({
                total: 0,
                pageSize: limit,
                page,
                data: [],
            });
        }

        const users = await serializeUsers(response.followersIds, user);

        resolve({
            total: responseTotal[0]?.total_sum ?? 0,
            pageSize: limit,
            page,
            data: users,
        });
    });
}

async function getUserFollowing(page, limit, address) {
    return new Promise(async (resolve, reject) => {
        let user = await User.findOne({address: address}, "_id");
        if (!user)
            return reject(
                new NotFoundError(Errors.ADDRESS_DOSE_NOT_EXIST.MESSAGE, Errors.ADDRESS_DOSE_NOT_EXIST.CODE, {
                    address,
                }),
            );

        let responce = await UserFollowLike.findOne(
            {userId: user._id},
            {
                followingIds: {
                    $slice: [limit * (page - 1), limit],
                },
            },
        ).populate("followingIds");
        let responceTotal = await UserFollowLike.aggregate([
            {$match: {userId: user._id}},
            {$unwind: "$followingIds"},
            {$group: {_id: "$_id", sum: {$sum: 1}}},
            {$group: {_id: null, total_sum: {$sum: "$sum"}}},
        ]);

        if (!responce)
            resolve({
                total: 0,
                pageSize: limit,
                page,
                data: [],
            });
        const users = await serializeUsers(responce.followingIds, user);

        resolve({
            total: responceTotal[0]?.total_sum ?? 0,
            pageSize: limit,
            page,
            data: users,
        });
    });
}

function getUserFavoriteToken(page, limit, userId) {
    return new Promise(async (resolve, reject) => {
        const user = await User.findOne({_id: userId});

        let response = await UserFollowLike.findOne(
            {userId: userId},
            {
                likedToken: {
                    $slice: [limit * (page - 1), limit],
                },
            },
        ).populate({path: "likedToken", match: {deletedAt: null}});


        let responseTotal = await UserFollowLike.aggregate([
            {$match: {userId: user._id}},
            {$unwind: "$likedToken"},
            {$group: {_id: "$_id", sum: {$sum: 1}}},
            {$group: {_id: null, total_sum: {$sum: "$sum"}}},
        ]);


        if (!response)
            resolve({
                total: 0,
                pageSize: limit,
                page,
                data: [],
            });

        if (!response?.likedToken || response?.likedToken.length === 0) {
            resolve({
                total: 0,
                pageSize: limit,
                page,
                data: [],
            });
        }


        const likes = await serializeLikes(response.likedToken, user);

        for (let i = 0; i < likes.length; i++)
            likes[i].is_liked = true

        resolve({
            total: response?.likedToken.length ?? 0,
            pageSize: limit,
            page,
            data: likes,
        });
    });

}

function getUserFavoriteCollection(page, limit, userId) {
    return new Promise(async (resolve, reject) => {

        const user = await User.findOne({_id: userId});

        let response = await UserFollowLike.findOne(
            {userId: userId},
            {
                likedCollection: {
                    $slice: [limit * (page - 1), limit],
                },
            },
        ).populate("likedCollection");

        let responseTotal = await UserFollowLike.aggregate([
            {$match: {userId: user._id}},
            {$unwind: "$likedCollection"},
            {$group: {_id: "$_id", sum: {$sum: 1}}},
            {$group: {_id: null, total_sum: {$sum: "$sum"}}},
        ]);

        if (!response)
            resolve({
                total: 0,
                pageSize: limit,
                page,
                data: [],
            });
        if (!response?.likedCollection || response?.likedCollection.length === 0) {
            resolve({
                total: 0,
                pageSize: limit,
                page,
                data: [],
            });
        }

        const users = await serializeCollections(response.likedCollection, user);

        resolve({
            total: responseTotal[0]?.total_sum ?? 0,
            pageSize: limit,
            page,
            data: users,
        });
    });

}

module.exports = {
    followUser,
    unFollowUser,
    likeToken,
    unLikeToken,
    likeCollection,
    unLikeCollection,
    getUserFollowers,
    getUserFollowing,
    getUserFavoriteToken,
    getUserFavoriteCollection
};

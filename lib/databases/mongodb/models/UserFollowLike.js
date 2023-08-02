const mongoose = require("../db");
const CollectionEngagement = require("./CollectionEngagement");
const TokenEngagement = require("./TokenEngagement");
const Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "userFollowLike";

/**
 *
 * @type {Schema | *}
 */
let UserFollowLikeSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        followersIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        followingIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        likedCollection: [
            {
                type: Schema.Types.ObjectId,
                ref: "userCollections",
            },
        ],
        likedToken: [
            {
                type: Schema.Types.ObjectId,
                ref: "userTokens",
            },
        ],
        ip: [
            {
                type: Schema.Types.String,
                default: null
            },
        ],
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

UserFollowLikeSchema.statics.countFollowers = async function (userId) {
    let doc = await this.findOne({userId}, "followersIds");
    if (!doc || !doc.followersIds) return 0;
    let length = doc.followersIds.length;
    if (doc.followersIds.includes(userId)) length--;
    return length;
};
UserFollowLikeSchema.statics.countFollowing = async function (userId) {
    let doc = await this.findOne({userId}, "followingIds");
    if (!doc || !doc.followingIds) return 0;
    let length = doc.followingIds.length;
    if (doc.followingIds.includes(userId)) length--;
    return length;
};
UserFollowLikeSchema.statics.countCollections = async function (userId) {
    let doc = await this.findOne({userId}, "likedCollection");
    if (!doc || !doc.likedCollection) return 0;
    let length = doc.likedCollection.length;
    if (doc.likedCollection.includes(userId)) length--;
    return length;
};

UserFollowLikeSchema.statics.countTokens = async function (userId) {
    let doc = await this.findOne({userId}, "likedToken");
    if (!doc || !doc.likedToken) return 0;
    let length = doc.likedToken.length;
    if (doc.likedToken.includes(userId)) length--;
    return length;
};
// Followers
UserFollowLikeSchema.statics.isFollowed = async function (userId = null, followerId = null) {
    return this.exists({
        userId: userId,
        followersIds: followerId,
    });
};

UserFollowLikeSchema.statics.isFollowing = async function (userId1 = null, userId2 = null) {
    return this.exists({
        userId: userId1,
        followingIds: userId2,
    });
};

UserFollowLikeSchema.statics.gotFollowed = async function (userId_1 = null, userId_2 = null) {
    let follower = await this.isFollowed(userId_1, userId_2);

    if (follower) return {ok: 1, nModified: 0};

    await mongoose.model("users").findByIdAndUpdate(userId_1, {
        $inc: {followersCount: 1},
    });

    await this.updateOne(
        {userId: userId_1},
        {
            $push: {
                followersIds: {
                    $each: [userId_2],
                    $position: 0,
                },
            },
        },
        {upsert: true},
    );
    return {ok: 1, nModified: 1};
};

UserFollowLikeSchema.statics.gotUnfollowed = async function (userId_1 = null, userId_2 = null) {
    let follower = await this.isFollowed(userId_1, userId_2);
    if (!follower) return {ok: 1, nModified: 0};
    await mongoose.model("users").findByIdAndUpdate(userId_1, {
        $inc: {followersCount: -1},
    });
    return this.updateOne(
        {userId: userId_1},
        {
            $pull: {followersIds: userId_2},
        },
    );
};
// Collection

UserFollowLikeSchema.statics.isLikedCollection = async function (userId = null, collectionId = null, ip = null) {
    if (userId)
        return this.exists({
            userId,
            likedCollection: collectionId,
        });
    else
        return this.exists({
            ip,
            likedCollection: collectionId,
        });
};

UserFollowLikeSchema.statics.collectionLiked = async function (userId = null, {collection_id, collectionId}, ip = null) {
    if (collectionId) {
        const collection = await mongoose.model("userCollections").findOne({_id: collectionId}, "_id");
        collection_id = collection._id;
    } else if (!collection_id)
        throw Error("Cannot determine collection");
    let res;
    if (userId) {
        let liked = await this.isLikedCollection(userId, collectionId);
        if (liked)
            return {ok: 1, nModified: 0};

        res = await this.updateOne(
            {userId},
            {
                $push: {
                    likedCollection: {
                        $each: [collection_id],
                        $position: 0,
                    },
                },
            },
            {upsert: true},
        );

        await CollectionEngagement.gotLiked(collection_id, userId);
    } else {
        let liked = await this.isLikedCollection(userId, collectionId, ip);
        if (liked)
            return {ok: 1, nModified: 0};

        res = await this.updateOne(
            {ip},
            {
                $push: {
                    likedCollection: {
                        $each: [collection_id],
                        $position: 0,
                    },
                },
            },
            {upsert: true},
        );

    }


    return res;
};

UserFollowLikeSchema.statics.collectionUnliked = async function (userId = null, {collection_id, collectionId}) {
    if (collectionId) {
        const collection = await mongoose.model("userCollections").findOne({_id: collectionId}, "_id");
        collection_id = collection._id;
    } else if (!collection_id) throw Error("Cannot determine collection");
    let liked = await this.isLikedCollection(userId, collection_id);
    if (!liked) return {ok: 1, nModified: 0};
    let res = await this.updateOne(
        {userId},
        {
            $pull: {likedCollection: collection_id},
        },
    );

    await CollectionEngagement.gotUnliked(collection_id, userId);
    return res;
};

//   Token
UserFollowLikeSchema.statics.isLikedToken = async function (userId = null, tokenId = null , ip = null) {
    if(userId){
        return this.exists({
            userId,
            likedToken: tokenId,
        });
    } else{
        return this.exists({
            ip,
            likedToken: tokenId,
        });
    }
};

UserFollowLikeSchema.statics.tokenLiked = async function (userId = null, {token_id, tokenId} , ip = null) {
    if (tokenId) {
        const token = await mongoose.model("userTokens").findOne({_id: tokenId}, "_id");
        token_id = token._id;
    } else if (!token_id) throw Error("Cannot determine token");

    let res;
    if(userId){
        let liked = await this.isLikedToken(userId, token_id);
        if (liked)
            return {ok: 1, nModified: 0};
        res = await this.updateOne(
            {userId},
            {
                $push: {
                    likedToken: {
                        $each: [token_id],
                        $position: 0,
                    },
                },
            },
            {upsert: true},
        );

        await TokenEngagement.gotLiked(token_id, userId);
    } else {
        let liked = await this.isLikedToken(userId, token_id , ip);
        if (liked)
            return {ok: 1, nModified: 0};
        res = await this.updateOne(
            {ip},
            {
                $push: {
                    likedToken: {
                        $each: [token_id],
                        $position: 0,
                    },
                },
            },
            {upsert: true},
        );
    }

    return res;
};

UserFollowLikeSchema.statics.tokenUnliked = async function (userId = null, {token_id, tokenId}) {
    if (tokenId) {
        const token = await mongoose.model("userTokens").findOne({_id: tokenId}, "_id");
        token_id = token._id;
    } else if (!token_id) throw Error("Cannot determine token");
    let liked = await this.isLikedToken(userId, token_id);
    if (!liked) return {ok: 1, nModified: 0};
    let res = await this.updateOne(
        {userId},
        {
            $pull: {likedToken: token_id},
        },
    );

    await TokenEngagement.gotUnliked(token_id, userId);
    return res;
};
module.exports = mongoose.model(COLLECTION_NAME, UserFollowLikeSchema);

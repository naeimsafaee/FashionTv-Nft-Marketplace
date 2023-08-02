const UserFollowLike = require("./UserFollowLike");
var mongoose = require("../db");
// const InternalSetting = require("./InternalSetting");
// require("mongoose-long")(mongoose);
var Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "users";

/**
 *
 * @type {Schema | *}
 */
var UserSchema = new Schema(
    {
        username: {
            type: String,
            index: true,
            default: null,
        },
        description: {
            type: String,
            default: null,
        },
        email: {
            type: String,
            default: null,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "PENDING", "INACTIVE"],
            default: "ACTIVE",
        },
        link: {
            type: Object,
            default: {},
        },
        image: {
            type: Array,
            default: [],
        },
        background: {
            type: Array,
            default: [],
        },
        address: {
            type: String,
            index: true,
            unique: true,
            required: true,
        },
        bscApprovedNft: {
            type: Boolean,
            default: false,
        },
        bscApprovedWallet: {
            type: Boolean,
            default: false,
        },
        level: {
            type: String,
            enum: ["AGENT", "NORMAL"],
            default: "NORMAL",
        },
        levelId: {
            type: Number
        },
        referralCode: {
            type: String,
        },
        referredCode: {
            type: String,
            allowNull: true,
        },
        referralCodeCount: {
            type: Number,
            default: 5,
        },
        seenReferredModal: {
            type: Boolean,
            default: false,
        },
        seenGhostModal: {
            type: Boolean,
            default: false,
        },
        password: {
            type: String,
            allowNull: true,
        },
        salt: {
            type: String,
            allowNull: true,
        },
        followersCount: {type: Number, default: 0},
        followingCount: {type: Number, default: 0},
        favoriteTokenCount: {type: Number, default: 0},
        favoriteCollectionCount: {type: Number, default: 0},
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);
UserSchema.statics.countToken = async function (userId) {
    return mongoose.model("userTokens").countDocuments({userId: userId});
};
UserSchema.statics.countCollection = async function (userId) {
    return mongoose.model("userCollections").countDocuments({user: userId});
};
UserSchema.methods.follow = async function (...listTobeFollow) {
    let res = {ok: 0};
    try {
        let res1 = await UserFollowLike.updateOne(
            {userId: this._id},
            {
                $push: {
                    followingIds: {
                        $each: listTobeFollow,
                        $position: 0,
                    },
                },
            },
            {upsert: true},
        );

        if (res1.ok) {
            await this.update({
                $inc: {followingCount: 1},
            });
        }
        res = {...res1};
    } catch (err) {
        console.log(err);
    } finally {
        return res;
    }
};
UserSchema.methods.unfollow = async function (...listTobeUnFollow) {
    let res = {ok: 0};
    try {
        let res1 = await UserFollowLike.updateOne(
            {userId: this._id},
            {
                $pull: {
                    followingIds: {
                        $in: listTobeUnFollow,
                    },
                },
            },
            {upsert: true},
        );

        if (res1.ok) {
            await this.update({
                $inc: {followingCount: -1},
            });
        }
        res = {...res1};
    } catch (err) {
        console.log(err);
    } finally {
        return res;
    }
};

// async function user_genId() {

// 	await InternalSetting.updateOne(
// 	  { ver: "1.0" },
// 	  {
// 		$inc: { currentUserId: 1 },
// 	  },
// 	  { upsert: true }
// 	);
// 	let { currentUserId } = await InternalSetting.findOne(
// 	  { ver: "1.0" },
// 	  "currentUserId"
// 	);
// 	return currentUserId;
//   }
// UserSchema.post("save", async (doc, next) => {

// 	if (!doc.id) {
// 	  let id = await user_genId();
// 	  await mongoose.model("User").updateOne(
// 		{ _id: doc._id },
// 		{
// 		  $set: {
// 			id: id,
// 			id_str: id.toString(),
// 		  },
// 		}
// 	  );
// 	}
// 	next();
// });

module.exports = mongoose.model(COLLECTION_NAME, UserSchema);

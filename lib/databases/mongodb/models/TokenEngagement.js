const mongoose = require("../db");
const Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "tokenEngagements";

/**
 *
 * @type {Schema | *}
 */
let TokenEngagements = new Schema(
	{
		tokenId: {
			type: Schema.Types.ObjectId,
			ref: "userTokens",
		},
		likedBy: [
			{
				type: Schema.Types.ObjectId,
				ref: "users",
			},
		],
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);
TokenEngagements.statics.gotLiked = async function (tokenId, userId) {
	if (await this.exists({ tokenId, likedBy: userId })) return;
	const token = await mongoose.model("userTokens").findById(tokenId);
	await token.updateOne({
		$inc: {
			favoriteCount: 1,
		},
	});

	return this.updateOne(
		{ tokenId },
		{
			$push: {
				likedBy: {
					$each: [userId],
					$position: 0,
				},
			},
		},
		{ upsert: true },
	);
};

TokenEngagements.statics.gotUnliked = async function (tokenId, userId) {
	if (!(await this.exists({ tokenId, likedBy: userId }))) return;
	const token = await mongoose.model("userTokens").findById(tokenId);
	await token.updateOne({
		$inc: {
			favoriteCount: -1,
		},
	});
	return this.updateOne(
		{ tokenId },
		{
			$pull: {
				likedBy: userId,
			},
		},
	);
};
module.exports = mongoose.model(COLLECTION_NAME, TokenEngagements);

const mongoose = require("../db");
const Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "collectionEngagements";

/**
 *
 * @type {Schema | *}
 */
let CollectionEngagements = new Schema(
	{
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: "userCollections",
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
CollectionEngagements.statics.gotLiked = async function (collectionId, userId) {
	if (await this.exists({ collectionId, likedBy: userId })) return;
	const collection = await mongoose.model("userCollections").findById(collectionId);
	await collection.updateOne({
		$inc: {
			favoriteCount: 1,
		},
	});

	return this.updateOne(
		{ collectionId },
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

CollectionEngagements.statics.gotUnliked = async function (collectionId, userId) {
	if (!(await this.exists({ collectionId, likedBy: userId }))) return;
	const collection = await mongoose.model("userCollections").findById(collectionId);
	await collection.updateOne({
		$inc: {
			favoriteCount: -1,
		},
	});
	return this.updateOne(
		{ collectionId },
		{
			$pull: {
				likedBy: userId,
			},
		},
	);
};
module.exports = mongoose.model(COLLECTION_NAME, CollectionEngagements);

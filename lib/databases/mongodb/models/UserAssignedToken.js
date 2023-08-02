const mongoose = require("../db");
const Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "userAssignedTokens";

/**
 *
 * @type {Schema | *}
 */
let UserAssignedTokenSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			index: true,
		},
		tokenId: {
			type: Schema.Types.ObjectId,
			ref: "userTokens",
			index: true,
		},
		collectionId: {
			type: Schema.Types.ObjectId,
			ref: "userCollections",
			index: true,
		},
		status: {
			type: String,
			enum: ["FREE", "IN_AUCTION", "TRANSFERRED", "SOLD", "PENDING", "BURNED" , "NOT_MINTED"],
			default: "PENDING",
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

UserAssignedTokenSchema.pre("findOne", function (next) {
	this.where({ deletedAt: null });

	next();
});

module.exports = mongoose.model(COLLECTION_NAME, UserAssignedTokenSchema);

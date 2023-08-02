const mongoose = require("../db");
const Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "userAuctionOffers";

/**
 *
 * @type {Schema | *}
 */
let UserAuctionsOfferSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
			index: true,
		},
		auctionId: {
			type: Schema.Types.ObjectId,
			ref: "userAuctions",
			index: true,
		},
		assignedTokenId: {
			type: Schema.Types.ObjectId,
			ref: "userAssignedTokens",
			index: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		expiresAt: {
			type: Date,
		},
		status: {
			type: String,
			enum: ["CANCEL", "REGISTER", "ACCEPTED", "DENIED"],
			default: "REGISTER",
		},
		signature: {
			type: Object,
			required: true,
			select: false,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

UserAuctionsOfferSchema.pre("findOne", function (next) {
	this.where({ deletedAt: null });

	next();
});

UserAuctionsOfferSchema.pre("findOneAndUpdate", function (next) {
	this.where({ deletedAt: null });

	next();
});

module.exports = mongoose.model(COLLECTION_NAME, UserAuctionsOfferSchema);

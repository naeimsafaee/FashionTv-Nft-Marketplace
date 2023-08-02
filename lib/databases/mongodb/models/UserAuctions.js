const mongoose = require("../db");
const Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "userAuctions";

/**
 *
 * @type {Schema | *}
 */
let UserAuctionsSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			required: true,
			index: true,
		},
		assignTokenId: {
			type: Schema.Types.ObjectId,
			ref: "userAssignedTokens",
			required: true,
			index: true,
		},
		start: {
			type: Date,
			required: true,
		},
		end: {
			type: Date,
			required: true,
		},
		status: {
			type: String,
			enum: ["ACTIVE", "INACTIVE", "FINISH"],
			default: "ACTIVE",
		},
		basePrice: {
			type: Number,
			default: null,
		},
		immediatePrice: {
			type: Number,
			default: null,
		},
		bookingPrice: {
			type: Number,
			default: null,
		},
		reserveAddress: {
			type: String,
			default: null,
		},
		signature: {
			type: Object,
			select: false,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

UserAuctionsSchema.pre("findOne", function (next) {
	this.where({ deletedAt: null });

	next();
});

module.exports = mongoose.model(COLLECTION_NAME, UserAuctionsSchema);

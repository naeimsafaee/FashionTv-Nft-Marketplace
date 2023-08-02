const mongoose = require("../db");
const Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "userActivity";

/**
 *
 * @type {Schema | *}
 */
let UserActivitySchema = new Schema(
	{
		from: {
			type: Schema.Types.ObjectId,
			ref: "users",
			index: true,
		},
		to: {
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
		price: {
			type: Number,
			default: 0,
		},
		quantity: {
			type: Number,
			default: 0,
		},
		type: {
			type: String,
			enum: ["LIST", "SALE", "OFFER", "TRANSFER", "MINT", "CANCEL", "BURN", "BID"],
		},
		blockNumber: {
			type: Number,
			default: null,
		},
		transactionHash: {
			type: String,
			default: null,
		},
		blockHash: {
			type: String,
			default: null,
		},
		extra: {
			type: Object,
			default: null,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model(COLLECTION_NAME, UserActivitySchema);

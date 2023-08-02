const mongoose = require("mongoose");
const TokenEngagement = require("./TokenEngagement");
const Schema = mongoose.Schema;

const UserCollectionSchema = new Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "users",
			// required: true,
			index: true,
		},
		name: {
			type: String,
		},
		description: {
			type: String,
		},
		category: [{
			type: Schema.Types.ObjectId,
			ref: "categories",
			index: true,
		}],
		image: {
			type: Array,
			default: [],
		},
		background: {
			type: Array,
			default: [],
		},
		featured: {
			type: Array,
			default: [],
		},
		links: {
			type: Object,
			default: {},
		},
		favoriteCount: { type: Number, default: 0 },
		explicitContent: { type: Boolean, default: false },
		isFeatured: {
			type: Boolean,
			default: false,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		isExplorer: {
			type: Boolean,
			default: false,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);


module.exports = mongoose.model("userCollections", UserCollectionSchema);

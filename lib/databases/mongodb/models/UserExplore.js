const mongoose = require("../db");
const Schema = mongoose.Schema;

const UserExploreSchema = new Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
		},
		address: {
			type: String,
			index: true,
		},
		type: {
			type: String,
			enum: ["USERS", "COLLECTIONS", "TOKENS"],
			required: true,
			index: true,
		},
		typeId: {
			type: Schema.Types.ObjectId,
			required: true,
			index: true,
		},
		userAvatar: {
			type: String,
			default: null,
		},
		tokenImage: {
			type: String,
			default: null,
		},
		collectionImage: {
			type: String,
			default: null,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("userExplorers", UserExploreSchema);

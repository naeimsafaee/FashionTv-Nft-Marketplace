const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		text: {
			type: String,
		},
		slug: {
			type: String,
		},
		status: {
			type: String,
			enum: ["ACTIVE", "INACTIVE"],
			default: "ACTIVE",
		},
		category: {
			type: Schema.Types.ObjectId,
			ref: "categories",
			default: null,
		},
		thumbnails: {
			type: Array,
			default: [],
		},
		images: {
			type: Array,
			default: [],
		},
		video: {
			type: String,
			default: null,
		},
		isHome: {
			type: Boolean,
			default: false,
		},
		type: {
			type: String,
			enum: ["FAQ", "ARTICLE", "ABOUT"],
			default: "ARTICLE",
		},
		likes: {
			type: Number,
			default: 0,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("blogs", BlogSchema);

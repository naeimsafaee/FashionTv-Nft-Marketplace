const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: null,
		},
		type: {
			type: String,
			enum: ["COLLECTION", "CONTENT"],
			default: "COLLECTION",
		},
		// images: {
		// 	type: Array,
		// 	default: [],
		// },
		icon: {
			dark: {
				type: Array,
				default: [],
			},
			light: {
				type: Array,
				default: [],
			},
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("categories", CategorySchema);

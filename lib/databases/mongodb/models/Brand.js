const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BrandSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		link: {
			type: String,
		},
		image: {
			type: Array,
			default: [],
		},

		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("brands", BrandSchema);

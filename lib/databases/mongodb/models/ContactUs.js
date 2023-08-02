const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactUsSchema = new Schema(
	{
		title: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		email: {
			type: String,
			required: true,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("contactUs", ContactUsSchema);

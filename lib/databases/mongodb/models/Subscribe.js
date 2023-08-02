const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscribeSchema = new Schema(
	{
		email: {
			type: String,
			required: true,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("subscribes", SubscribeSchema);

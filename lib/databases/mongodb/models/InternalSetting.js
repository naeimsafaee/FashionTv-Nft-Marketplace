const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InternalSetting = new Schema(
	{
		ver: {
			type: String,
			default: "1.0",
		},
		currentUserId: {
			type: Number,
			default: 0,
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("internalSetting", InternalSetting);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema(
	{
		key: {
			type: String,
		},
		value: String,
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("eventBlockNumber", EventSchema);

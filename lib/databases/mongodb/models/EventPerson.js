const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventPersonSchema = new Schema(
	{
		signature: {
			type: Array,
			default: [],
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("eventPersons", EventPersonSchema);

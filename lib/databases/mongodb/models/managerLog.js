const mongoose = require("../db");
const Schema = mongoose.Schema;

const managerLogSchema = new Schema(
	{
		managerId: {
			type: Schema.Types.ObjectId,
			ref: "managers",
		},
		action: {
			type: String,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("managerLogs", managerLogSchema);

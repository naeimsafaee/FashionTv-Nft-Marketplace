const mongoose = require("../db");
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema(
	{
		name: {
			type: String,
			defaultValue: "General",
		},
		description: {
			type: String,
		},
		headManagerId: {
			type: Schema.Types.ObjectId,
			ref: "managers",
		},
		deletedAt: { type: Date, default: null },

		managers: [{ type: Schema.Types.ObjectId, ref: "managers" }],
	},
	{ timestamps: true },
);

module.exports = mongoose.model("departments", DepartmentSchema);

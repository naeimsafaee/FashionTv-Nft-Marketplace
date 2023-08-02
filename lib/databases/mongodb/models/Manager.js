const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ManagerSchema = new Schema(
	{
		name: String,
		mobile: String,
		email: String,
		password: String,
		salt: String,
		roleId: {
			type: Schema.Types.ObjectId,
			ref: "roles",
		},
		status: {
			type: Boolean,
			default: true,
		},
		avatar: {
			type: Array,
			default: [],
		},

		isSuperadmin: {
			type: Boolean,
			defaultValue: false,
		},
		isGeneral: {
			type: Boolean,
			defaultValue: false,
		},
		deletedAt: { type: Date, default: null },

		departments: [{ type: Schema.Types.ObjectId, ref: "departments" }],
	},
	{ timestamps: true },
);

module.exports = mongoose.model("managers", ManagerSchema);

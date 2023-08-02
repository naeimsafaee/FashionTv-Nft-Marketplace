const mongoose = require("../db");
const Schema = mongoose.Schema;

const roleSchema = new Schema(
	{
		name: {
			type: String,
		},
		nickName: {
			type: String,
		},
		permissions: [
			{
				type: Schema.Types.ObjectId,
				ref: "permissions",
			},
		],
	},
	{ timestamps: true },
);

module.exports = mongoose.model("roles", roleSchema);

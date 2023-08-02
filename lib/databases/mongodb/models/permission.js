const mongoose = require("../db");
const Schema = mongoose.Schema;

const permissionSchema = new Schema(
	{
		name: {
			type: String,
		},
		nickName: {
			type: String,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("permissions", permissionSchema);

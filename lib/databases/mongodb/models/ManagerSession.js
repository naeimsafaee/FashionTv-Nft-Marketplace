const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ManagerSessionSchema = new Schema(
	{
		manager: {
			type: Schema.Types.ObjectId,
			ref: "managers",
		},
		ip: String,
		refreshToken: String,
		accessExpiresAt: Date,
		expiresAt: Date,
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("managerSessions", ManagerSessionSchema);

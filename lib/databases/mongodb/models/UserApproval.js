const mongoose = require("../db");
const Schema = mongoose.Schema;

const UserApprovalchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users",
			index: true,
			required: true,
		},
		chain: {
			type: String,
			enum: ["ETHEREUM", "POLYGON"],
			index: true,
			required: true,
		},
		currency: {
			type: String,
			enum: ["WETH"],
			default: "WETH",
			index: true,
		},
		balance: {
			type: String,
			default: "0",
		},
		amountApproved: {
			type: String,
			default: "0",
		},
		amountOffers: {
			type: String,
			default: "0",
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("userApprovals", UserApprovalchema);

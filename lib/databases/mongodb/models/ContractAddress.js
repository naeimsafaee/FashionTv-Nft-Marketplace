const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContractAddressSchema = new Schema(
	{
		address: {
			type: String,
			required: true,
			index: true,
		},
		chain: {
			type: String,
			enum: ["ETHEREUM", "POLYGON"],
			required: true,
		},
		type: {
			type: String,
			enum: ["ERC721", "ERC20", "EXCHANGE"],
			required: true,
		},
		status: {
			type: String,
			enum: ["ACTIVE", "INACTIVE"],
			default: "ACTIVE",
		},
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("contractAddresses", ContractAddressSchema);

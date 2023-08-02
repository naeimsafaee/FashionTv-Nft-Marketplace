const mongoose = require("../db");
const Schema = mongoose.Schema;

const AgentRewardSchema = new Schema(
	{
		agentId: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		},
		auctionId: {
			type: Schema.Types.ObjectId,
			ref: 'auctions'
		},
		agentLinkId: {
			type: Schema.Types.ObjectId,
			ref: 'agentLinks'
		},
		commission: {
			type: Number,
			default: 0,
		},

		deletedAt: {type: Date, default: null},
	},
	{timestamps: true},
);

module.exports = mongoose.model("agentRewards", AgentRewardSchema);

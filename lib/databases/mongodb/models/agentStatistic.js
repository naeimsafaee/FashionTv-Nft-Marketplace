const mongoose = require("../db");
const Schema = mongoose.Schema;

const AgentStatisticSchema = new Schema(
	{
		agentId: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		},
		total: {
			type: Number,
			default: 0,
		},

		deletedAt: {type: Date, default: null},
	},
	{timestamps: true},
);

module.exports = mongoose.model("agentStatistics", AgentStatisticSchema);

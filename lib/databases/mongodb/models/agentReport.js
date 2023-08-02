const mongoose = require("../db");
const Schema = mongoose.Schema;

const AgentReportSchema = new Schema(
	{
		agentId: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		},
		totalAmount: {
			type: Number,
			default: 0,
		},
		totalUsers: {
			type: Number,
			default: 0,
		},

		deletedAt: {type: Date, default: null},
	},
	{timestamps: true},
);

module.exports = mongoose.model("agentReports", AgentReportSchema);

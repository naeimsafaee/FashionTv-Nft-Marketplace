const mongoose = require("../db");
const Schema = mongoose.Schema;

const AgentSessionSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		},
		ip: {
			type: String,
		},
		accessToken: {
			type: String,
		},
		refreshToken: {
			type: String,
		},
		accessExpiresAt: {
			type: Date,
		},
		refreshExpiresAt: {
			type: Date,
		},

	},
	{timestamps: true},
);

module.exports = mongoose.model("agentSessions", AgentSessionSchema);

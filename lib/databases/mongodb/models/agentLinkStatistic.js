const mongoose = require("../db");
const Schema = mongoose.Schema;

const AgentLinkStatisticSchema = new Schema(
    {
        agentLinkId: {
            type: Schema.Types.ObjectId,
            ref: 'agentLinks'
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("agentLinkStatistics", AgentLinkStatisticSchema);

const mongoose = require("../db");
const Schema = mongoose.Schema;

const AgentLinkSchema = new Schema(
    {
        agentId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        name: {
            type: String,
        },
        code: {
            type: String,
        },
        clickCount: {
            type: Number,
            default: 0,
        },
        completedCount: {
            type: Number,
            default: 0,
        },
        type: {
            type: String,
            enum: ['REGISTER'],
            default: "REGISTER",
        },
        url: {
            type: String,
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("agentLinks", AgentLinkSchema);

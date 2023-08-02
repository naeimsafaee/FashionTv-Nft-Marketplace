const mongoose = require("../db");
const Schema = mongoose.Schema;

const matchParticipantSchema = new Schema(
    {
        participantTeamId: {
            type: Schema.Types.ObjectId,
            ref: "matchParticipantTeams",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "tasks",
            required: true,
        },
        competitionId: {
            type: Schema.Types.ObjectId,
            ref: "competitions",
            required: true,
        },
        tokenId: {
            type: Schema.Types.ObjectId,
            ref: "userTokens",
            required: true,
        },
        score: {
            type: Schema.Types.Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["OPEN", "CLOSE"],
            default: "OPEN",
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("matchParticipants", matchParticipantSchema);

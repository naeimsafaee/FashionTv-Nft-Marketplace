const mongoose = require("../db");
const Schema = mongoose.Schema;

const matchParticipantTeamSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        diamondId: {
            type: Schema.Types.ObjectId,
            ref: "diamonds",
            required: true,
        },
        diamondTypeId: {
            type: Schema.Types.ObjectId,
            ref: "diamondTypes",
            required: true,
        },
        auctionId: {
            type: Schema.Types.ObjectId,
            ref: "auctions",
            required: false,
        },
        competitionId: {
            type: Schema.Types.ObjectId,
            ref: "competitions",
            required: true,
        },
        score: {
            type: Number,
            default: 0
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("matchParticipantTeams", matchParticipantTeamSchema);

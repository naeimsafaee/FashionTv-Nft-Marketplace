const mongoose = require("../db");
const Schema = mongoose.Schema;

const LeaderboardSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        diamondTypeId: {
            type: Schema.Types.ObjectId,
            ref: "diamondTypes",
            required: true,
        },
        competitionId: {
            type: Schema.Types.ObjectId,
            ref: "competition",
            required: true,
        },
        assetId: {
            type: Schema.Types.ObjectId,
            ref: "assets",
            required: true,
        },
        score: {
            type: Schema.Types.Decimal128,
            default: 0,
        },
        rank: {
            type: Number,
            default: 0,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("Leaderboards", LeaderboardSchema);

const mongoose = require("../db");
const Schema = mongoose.Schema;

const UserPrizeSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        amount: {
            type: Number,
            default: 0
        },
        rank: {
            type: Number
        },
        competitionId: {
            type: Schema.Types.ObjectId,
            ref: "competitions",
            required: true,
            index: true,
        },
        assetId: {
            type: Schema.Types.ObjectId,
            ref: "assets",
            required: true,
            index: true,
        },
        diamondTypeId: {
            type: Schema.Types.ObjectId,
            ref: "assets",
            required: true,
            index: true,
        }
    },
    {timestamps: true},
);

module.exports = mongoose.model("userPrizes", UserPrizeSchema);

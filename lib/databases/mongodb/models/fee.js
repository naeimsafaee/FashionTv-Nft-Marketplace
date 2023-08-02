const mongoose = require("../db");
const Schema = mongoose.Schema;

const FeeSchema = new Schema(
    {
        userType: {
            type: String,
            enum: ["AGENT", "NORMAL"],
            defaultValue: "NORMAL",
        },
        userLevel: {
            type: Number,
            default: 0,
        },
        depositFee: {
            type: Number,
            default: 0,
        },
        withdrawFee: {
            type: Number,
            default: 0,
        },
        referralReward: {
            type: Number,
            default: 0,
        },
        userCount: {
            type: Number,
            default: 0,
        },
        targetPrice: {
            type: Number,
            default: 0,
        },
        reward: {
            type: Number,
            default: 0,
        },
        assetId: {
            type: Schema.Types.ObjectId,
            ref: 'assets'
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("fees", FeeSchema);

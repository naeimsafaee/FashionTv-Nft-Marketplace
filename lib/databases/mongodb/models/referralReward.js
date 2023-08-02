const mongoose = require("../db");
const Schema = mongoose.Schema;

const referralRewardSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        referredUserId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        type: {
            type: String,
            enum: ["SUBSCRIPTION", "TICKET", "REFERRAL", "DIAMOND", "REGISTER"],
        },
        typeId: {
            type: String,
        },
        amount: {
            type: Number,
        },
        feePercent: {
            type: Number,
        },
        assetId: {
            type: Schema.Types.ObjectId,
            ref: 'assets'
        },
        level: {
            type: Number,
            default: 0,
        },
        auctionId: {
            type: Schema.Types.ObjectId,
            ref: 'auctions'
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("referralRewards", referralRewardSchema);

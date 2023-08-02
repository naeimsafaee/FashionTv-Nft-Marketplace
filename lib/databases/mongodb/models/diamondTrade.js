const mongoose = require("../db");
const Schema = mongoose.Schema;

const diamondTradeSchema = new Schema(
    {
        payerId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        payeeId: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        auctionId: {
            type: Schema.Types.ObjectId,
            ref: "auctions",
        },
        diamondId: {
            type: Schema.Types.ObjectId,
            ref: "diamonds",
        },
        amount: {
            type: Number,
            default: 0
        },
        fee: {
            type: Number,
            default: 0
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("diamondTrades", diamondTradeSchema);

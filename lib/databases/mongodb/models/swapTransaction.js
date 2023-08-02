const mongoose = require("../db");
const Schema = mongoose.Schema;

const SwapTransactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        assetInId: {
            type: Schema.Types.ObjectId,
            ref: "assets",
        },
        assetOutId: {
            type: Schema.Types.ObjectId,
            ref: "assets",
        },
        balanceIn: {
            type: Number,
            allowNull: false,
        },
        amountOut: {
            type: Number,
            allowNull: false,
        },
        fee: {
            type: Number,
            defaultValue: 0,
        },
        currentWalletInBalance: {
            type: Number,
            allowNull: false,
            defaultValue: 0,
        },
        afterWalletInBalance: {
            type: Number,
            allowNull: false,
            defaultValue: 0,
        },
        currentWalletOutBalance: {
            type: Number,
            allowNull: false,
            defaultValue: 0,
        },
        afterWalletOutBalance: {
            type: Number,
            allowNull: false,
            defaultValue: 0,
        },
        afterWalletInFrozen: {
            type: Number,
            allowNull: false,
            defaultValue: 0,
        },
        currentWalletInFrozen: {
            type: Number,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: String, //pending|completed
        },
        agent: {
            type: String,
        },
        txId: {
            type: String,
        },
        profit: {
            type: Number,
            defaultValue: 0,
        },
    },
    {timestamps: true},
);

module.exports = mongoose.model("swapTransaction", SwapTransactionSchema);

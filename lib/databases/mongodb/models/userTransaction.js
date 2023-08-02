const mongoose = require("../db");
const {array} = require("joi");
const Schema = mongoose.Schema;

const userTransactionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ["DEPOSIT", "WITHDRAW", "TRANSFER", "SWAP"],
            defaultValue: "DEPOSIT",
        },
        assetNetworkId: {
            type: Schema.Types.ObjectId,
            ref: "assetNetwork",
            required: true,
            index: true,
        },
        address: {
            type: String,
        },
        tag: {
            type: String,
        },
        amount: {
            type: Number,
        },
        previousBalance: {
            type: Number,
        },
        withdrawFee: {
            type: Number,
        },
        depositFee: {
            type: Number,
        },
        fee: {
            type: Number,
        },
        gasPrice: {
            type: Number,
        },
        gasLimit: {
            type: Number,
        },
        status: {
            type: String,
            enum: ["AUDITING", "PENDING", "REJECTED", "DONE"],
            defaultValue: "AUDITING",
        },
        txid: {
            type: String,
            allowNull: true,
        },
        info: {
            type: String,
            allowNull: true,
        },
        account: {
            type: String,
            enum: ["STARLEX", "ALGOTREX"],
        },
        assetId: {
            type: Schema.Types.ObjectId,
            ref: "assets",
            required: true,
            index: true,
        },
        index: {
            type: Number,
            defaultValue: 0,
        },
        from_agent_panel: {
            type: Boolean,
            defaultValue: false,
        },
        origin: {
            type: String,
            enum: ["ADMIN", "SYSTEM"],
        },
        extra: {
            type: Array,
            allowNull: true,
        },
        profit: {
            type: Number,
            defaultValue: 0,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("userTransactions", userTransactionSchema);

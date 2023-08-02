const mongoose = require("../db");
const Schema = mongoose.Schema;

const AssetNetworkSchema = new Schema(
    {
        assetId: {
            type: Schema.Types.ObjectId,
            ref: 'assets'
        },
        networkId: {
            type: Schema.Types.ObjectId,
            ref: 'networks'
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        withdrawFee: {
            type: Number,
            defaultValue: 0,
        },
        depositFee: {
            type: Number,
            defaultValue: 0,
        },
        fee: {
            type: Number,
            defaultValue: 0,
        },
        gasPrice: {
            type: Number,
            defaultValue: 0,
        },
        gasLimit: {
            type: Number,
            defaultValue: 0,
        },
        minConfirm: {
            type: Number,
        },
        unlockConfirm: {
            type: Number,
        },
        canDeposit: {
            type: Boolean,
            default: true,
        },
        canWithdraw: {
            type: Boolean,
            default: true,
        },
        withdrawMin: {
            type: Number,
        },
        depositMin: {
            type: Number,
        },
        withdrawDescription: {
            type: String,
            required: false,
        },
        depositDescription: {
            type: String,
            required: false,
        },
        specialTips: {
            type: String,
            required: false,
        },
        feeType: {
            type: String,
            enum: ["FEE", "GAS"],
        },
        apiCode: {
            type: String,
        },
    },
    {timestamps: true},
);

module.exports = mongoose.model("assetNetwork", AssetNetworkSchema);

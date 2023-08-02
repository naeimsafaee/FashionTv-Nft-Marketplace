const mongoose = require("../db");
const Schema = mongoose.Schema;

const AssetSchema = new Schema(
    {
        coin: {
            type: String
        },
        name: {
            type: String,
        },
        title: {
            type: String,
        },
        precision: {
            type: Number,
            default: 8,
        },
        type: {
            type: String,
            enum: ["COIN", "TOKEN", "FIAT"],
            default: "FIAT",
        },
        canDeposit: {
            type: Boolean,
            default: true,
        },
        canWithdraw: {
            type: Boolean,
            default: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        hasTag: {
            type: Boolean,
            default: false,
        },
        icon: {
            type: Array,
            default: [],
        },
        address: {
            type: String,
        },
        isNative: {
            type: Boolean,
            default: false
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("assets", AssetSchema);

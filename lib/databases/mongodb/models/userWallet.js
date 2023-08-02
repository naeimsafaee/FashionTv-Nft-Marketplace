const mongoose = require("../db");
const Schema = mongoose.Schema;

const userWalletSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        assetId: {
            type: Schema.Types.ObjectId,
            ref: "assets",
            required: true,
            index: true,
        },
        amount: {
            type:Number,
            default: 0,
        },
        frozen: {
            type:Number,
            default: 0,
        },
        pending: {
            type:Number,
            default: 0,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("userWallets", userWalletSchema);

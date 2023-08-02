const mongoose = require("../db");
const Schema = mongoose.Schema;

const TransferSchema = new Schema(
    {
        tokenId: {
            type: Number,
        },
        from: {
            type: String,
        },
        to: {
            type: String,
        },
        blockNumber: {
            type: String,
        },
        transactionHash: {
            type: String,
        },
        blockHash: {
            type: String,
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("transfers", TransferSchema);

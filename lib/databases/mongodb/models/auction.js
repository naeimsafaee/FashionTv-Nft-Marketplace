const mongoose = require("../db");
const Schema = mongoose.Schema;

const AuctionSchema = new Schema(
    {
        diamondId: {
            type: Schema.Types.ObjectId,
            ref: "diamonds",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: false,
            index: true,
        },
        diamondTypeId: {
            type: Schema.Types.ObjectId,
            ref: "diamondTypes",
            required: false,
            index: true,
        },
        price: {
            type: Number,
            default: 0,
        },
        chainId: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "FINISHED", "RESERVED"],
            default: "ACTIVE",
        },
    },
    {timestamps: true},
);

module.exports = mongoose.model("auctions", AuctionSchema);

const mongoose = require("../db");
const Schema = mongoose.Schema;

const UserDiamondSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        diamondId: {
            type: Schema.Types.ObjectId,
            ref: "diamonds",
            required: true,
        },
        auctionId: {
            type: Schema.Types.ObjectId,
            ref: "auctions",
            required: false,
        },
        status: {
            type: String,
            enum: ["BOUGHT", "GIFT"],
            default: "BOUGHT",
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("userDiamond", UserDiamondSchema);

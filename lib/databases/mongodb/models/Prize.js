const mongoose = require("../db");
const Schema = mongoose.Schema;

const PrizeSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        rank: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        assetId: {
            type: Schema.Types.ObjectId,
            ref: "assets",
            required: true,
        },
        diamondTypeId: {
            type: Schema.Types.ObjectId,
            ref: "diamondTypes",
            required: true,
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("prizes", PrizeSchema);

const mongoose = require("../db");
const Schema = mongoose.Schema;

const DiamondSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
        },
        diamondTypeId: {
            type: Schema.Types.ObjectId,
            ref: "diamondTypes",
            required: true,
            index: true,
        },
        image: {
            type: Array,
            default: [],
        },
        ipfsImage: {
            type: String,
        },
        serialNumber: {
            type: String,
        },
        edition: {
            type: Number,
        },
        allowedUsageNumber: {
            type: Number,
            default: 1,
        },
        amount: {
            type: Number,
            default: 0,
        },
        sellCount: {
            type: Number,
            default: 0,
        },
        attributes: {
            type: Array,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("diamonds", DiamondSchema);

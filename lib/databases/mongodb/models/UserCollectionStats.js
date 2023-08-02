const mongoose = require("../db");
const Schema = mongoose.Schema;

/**
 * GET COLLECTION NAME
 * @type {string}
 */
const COLLECTION_NAME = "userCollectionStats";

/**
 *
 * @type {Schema | *}
 */
let UserCollectionStatsSchema = new Schema(
    {
        collectionId: {
            type: Schema.Types.ObjectId,
            ref: "userCollections",
            index: true,
            required: true,
        },
        categoryId: [{
            type: Schema.Types.ObjectId,
            ref: "categories",
            index: true,
        }],
        type: {
            type: String,
            enum: ["24H", "7D", "30D", "ALL"],
            required: true,
            index: true,
        },
        volume: {
            type: Number,
            default: 0,
        },
        floorPrice: {
            type: Number,
            default: 0,
        },
        owners: {
            type: Number,
            default: 0,
        },
        items: {
            type: Number,
            default: 0,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model(COLLECTION_NAME, UserCollectionStatsSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserTokenSchema = new Schema(
    {
        name: {
            type: String,
            index: true,
            required: true,
        },
        description: String,
        supply: {
            type: Number,
            default: 1,
        },
        // IPFS Callback Result
        ipfsFile: {
            type: Object,
            default: {},
        },
        // Network Type
        chain: {
            type: String,
            enum: ["ETHEREUM", "POLYGON", 'BSC'],
            index: true,
            required: true,
        },
        unblockableContent: {
            type: String,
            select: false, // not return in find
        },
        // royalities: [
        // 	{
        // 		address: String,
        // 		value: String,
        // 	},
        // ],
        url: String,
        properties: [
            {
                title: {type: String, index: true},
                values: [{type: String, trim: true, index: true}],
            },
        ],
        mainFile: {
            type: Array,
            default: [],
        },
        thumbnail: {
            type: Array,
            default: [],
        },
        favoriteCount: {type: Number, default: 0},
        collectionId: {
            type: Schema.Types.ObjectId,
            ref: "userCollections",
            index: true,
            required: true,
        },
        serialId: {
            type: String,
            index: true,
            required: true,
        },
        fee: {
            type: Number,
            default: 0,
        },
        isSlider: {
            type: Boolean,
            default: false,
        },
        isTrend: {
            type: Boolean,
            default: false,
        },
        explicitContent: {type: Boolean, default: false},
        contractAddress: {
            type: String,
            index: true,
            required: true,
        },
        isLazyMint: {
            type: Boolean,
            default: false,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("userTokens", UserTokenSchema);

const mongoose = require("../db");
const Schema = mongoose.Schema;

const DiamondTypeSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: Array,
            default: [],
        },
        calculator_image: {
            type: Array,
            default: [],
        },
        price :{
            type:Number,
            required: true,
        },
        saleID :{
            type:Number,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("diamondTypes", DiamondTypeSchema);

const mongoose = require("../db");
const Schema = mongoose.Schema;

const CompetitionSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            index: true,
        },
        startAt: {
            type: Date,
            required: true,
        },
        endAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["OPEN", "COMPLETED", "INACTIVE"],
            default: "INACTIVE",
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("competitions", CompetitionSchema);

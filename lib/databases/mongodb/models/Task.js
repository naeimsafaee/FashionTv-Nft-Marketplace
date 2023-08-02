const mongoose = require("../db");
const Schema = mongoose.Schema;

const TaskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            index: true,
        },
        description: {
            type: String,
            required: true,
            index: true,
        },
        competitionId: {
            type: Schema.Types.ObjectId,
            ref: "competitions",
            required: true,
            index: true,
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
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("tasks", TaskSchema);

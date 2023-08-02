const mongoose = require("../db");
const Schema = mongoose.Schema;

const UserTaskSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        diamondId: {
            type: Schema.Types.ObjectId,
            ref: "diamondTypes",
            required: true,
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: "tasks",
            required: true,
        },
        tokenId: {
            type: Schema.Types.ObjectId,
            ref: "userTokens",
            required: true,
        },
        competitionId: {
            type: Schema.Types.ObjectId,
            ref: "competitions",
            required: true,
            index: true,
        },
        score: {
            type: Schema.Types.Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ["OPEN", "CLOSE"],
            default: "OPEN",
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("userTasks", UserTaskSchema);

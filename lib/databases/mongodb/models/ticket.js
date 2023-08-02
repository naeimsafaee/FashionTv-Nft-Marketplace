const mongoose = require("../db");
const Schema = mongoose.Schema;

const TicketSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users'
        },
        managerId: {
            type: Schema.Types.ObjectId,
            ref: 'managers'
        },
        title: {
            type: String,
        },
        text: {
            type: String,
        },
        note: {
            type: String,
        },
        tag: {
            type: Array,
        },
        code: {
            type: String,
        },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            allowNull: false,
        },
        status: {
            type: String,
            enum: ["CREATED", "REPLIED", "PENDING", "CLOSED", "REVIEW"],
            default: "CREATED",
        },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'departments'
        },
        file: {
            type: Array,
            default: [],
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("tickets", TicketSchema);

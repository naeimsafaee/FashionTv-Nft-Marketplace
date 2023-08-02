const mongoose = require("../db");
const Schema = mongoose.Schema;

const userNotificationSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
            index: true,
        },
        title: {
            type: String,

        },
        description: {
            type: String,
        },
        status: {
            type: Boolean,
            default: false,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("userNotifications", userNotificationSchema);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SettingSchema = new Schema(
    {
        type: {
            type: String,
        },
        key: {
            type: String,
        },
        value: {
            type: String,
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

SettingSchema.pre("find", function (next) {
    this.where({deletedAt: null});

    next();
});

module.exports = mongoose.model("settings", SettingSchema);

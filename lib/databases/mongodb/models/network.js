const mongoose = require("../db");
const Schema = mongoose.Schema;

const NetworkSchema = new Schema(
    {
        name: {
            type: String,
        },
        type: {
            type: String,
        },
        isDefault: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true},
);

module.exports = mongoose.model("networks", NetworkSchema);

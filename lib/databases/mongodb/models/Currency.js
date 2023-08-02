const mongoose = require("../db");
const Schema = mongoose.Schema;

const CurrencySchema = new Schema(
    {
        from: {
            type: String
        },
        to: {
            type: String
        },
        rate: {
            type: String
        }
    },
    {timestamps: true},
);

module.exports = mongoose.model("Currencies", CurrencySchema);

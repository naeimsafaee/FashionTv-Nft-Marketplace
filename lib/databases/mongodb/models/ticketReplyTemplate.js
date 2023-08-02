const mongoose = require("../db");
const Schema = mongoose.Schema;

const TicketReplyTemplateSchema = new Schema(
    {
        name: {
            type: String
        },
        text: {
            type: String
        },
        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("ticketReplyTemplate", TicketReplyTemplateSchema);

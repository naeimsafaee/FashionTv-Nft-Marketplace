const mongoose = require("../db");
const Schema = mongoose.Schema;

const ReplySchema = new Schema(
	{
		ticketId: {
			type: Schema.Types.ObjectId,
			ref: 'tickets'
		},
		text: {
			type: String,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'users'
		},
		managerId: {
			type: Schema.Types.ObjectId,
			ref: 'managers'
		},
		isApproved: {
			type: Boolean,
		},
		file: {
			type: Array,
			default: [],
		},
		deletedAt: {type: Date, default: null},
	},
	{timestamps: true},
);

module.exports = mongoose.model("reply", ReplySchema);

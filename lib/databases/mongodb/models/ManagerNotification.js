const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ManagerNotificationSchema = new Schema(
	{
		type: {
			type: String,
			enum: ["COLLECTION_CREATED", "AUCTION_FINISHED"],
		},
		title: String,
		body: {
			type: Object,
			auction: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "userAuctions",
			},
			collection: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "userCollections",
			},
		},
		read: { type: Boolean, default: false },
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("ManagerNotifications", ManagerNotificationSchema);

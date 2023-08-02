/*
| Author : Mohammad Ali Ghazi
| Email  : mohamadalghazy@gmail.com
| Date   : Sat Apr 30 2022
| Time   : 4:11:21 PM
 */

const {
	mongodb: { UserCollectionStats },
} = require("../../databases");
const moment = require("moment");
const { mongoose, UserCollection, UserAssignedToken } = require("../../databases/mongodb");

/**
 * update user collection stats
 * @param {*} collectionId
 * @param {*} volume
 * @param {*} floorPrice
 * @param {*} owners
 * @param {*} items
 * @returns
 */
exports.updateCollectionStats = (collectionId, volume, floorPrice, owners, items) => {
	return new Promise(async (resolve, reject) => {
		let current = moment();

		const thisCollection = await UserCollection.findById(collectionId).select("category").lean();

		// check collection owners
		if (owners) {
			owners = await UserAssignedToken.aggregate([
				{
					$match: {
						collectionId: mongoose.Types.ObjectId(collectionId),
						status: {
							$in: ["FREE", "IN_AUCTION"],
						},
					},
				},
				{
					$group: {
						_id: "$userId",
						count: {
							$sum: 1,
						},
					},
				},
			]).exec();

			if (owners.length) owners = owners.length;
			else owners = null;
		}

		// update Collection statistics in the last 24 hours
		await UserCollectionStats.findOneAndUpdate(
			{
				collectionId,
				createdAt: {
					$gte: current.startOf("day").toDate(),
					$lte: current.endOf("day").toDate(),
				},
				type: "24H",
			},
			{
				collectionId,
				...(volume ? { $inc: { volume } } : {}),
				...(floorPrice ? { $inc: { floorPrice } } : {}),
				...(owners ? { owners } : {}),
				...(items ? { $inc: { items } } : {}),
				type: "24H",
				categoryId: thisCollection.category,
			},
			{ upsert: true },
		);

		// update Collection statistics in the last week
		await UserCollectionStats.findOneAndUpdate(
			{
				collectionId,
				createdAt: {
					$gte: current.startOf("week").toDate(),
					$lte: current.endOf("week").toDate(),
				},
				type: "7D",
			},
			{
				collectionId,
				...(volume ? { $inc: { volume } } : {}),
				...(floorPrice ? { $inc: { floorPrice } } : {}),
				...(owners ? { owners } : {}),
				...(items ? { $inc: { items } } : {}),
				type: "7D",
				categoryId: thisCollection.category,
			},
			{ upsert: true },
		);

		// update Collection statistics in the last month
		await UserCollectionStats.findOneAndUpdate(
			{
				collectionId,
				createdAt: {
					$gte: current.startOf("month").toDate(),
					$lte: current.endOf("month").toDate(),
				},
				type: "30D",
			},
			{
				collectionId,
				...(volume ? { $inc: { volume } } : {}),
				...(floorPrice ? { $inc: { floorPrice } } : {}),
				...(owners ? { owners } : {}),
				...(items ? { $inc: { items } } : {}),
				type: "30D",
				categoryId: thisCollection.category,
			},
			{ upsert: true },
		);

		// update Collection statistics for all (rom the beginning of registration)
		await UserCollectionStats.findOneAndUpdate(
			{
				collectionId,
				type: "ALL",
			},
			{
				collectionId,
				...(volume ? { $inc: { volume } } : {}),
				...(floorPrice ? { $inc: { floorPrice } } : {}),
				...(owners ? { owners } : {}),
				...(items ? { $inc: { items } } : {}),
				type: "ALL",
				categoryId: thisCollection.category,
			},
			{ upsert: true },
		);

		return resolve();
	});
};

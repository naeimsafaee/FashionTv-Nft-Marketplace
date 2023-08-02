const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");
const { Prize, Asset, DiamondType, Blog } = require("../../databases/mongodb");
const { NotFoundError, HumanError } = require("./errorhandler");
const mongoose = require("mongoose");

function getPrizes(data) {
	return new Promise(async (resolve, reject) => {
		const { diamondTypeId, limit, page, order, sort, rank, searchQuery, amount, createdAt, id, title } = data;

		let query = {};
		query.deletedAt = null;

		if (id) query._id = mongoose.Types.ObjectId(id);
		if (rank) query.rank = rank;
		if (title) query.title = new RegExp(title, "i");
		if (amount && parseFloat(amount) >= 0) query.amount = amount;
		// if (diamondTypeId) query.diamondTypeId = {$in: diamondTypeId};
		if (diamondTypeId) {
			let output = diamondTypeId.map((diamondtypeid) => {
				let ids = mongoose.Types.ObjectId(diamondtypeid);
				return ids;
			});
			query = { ...query, "diamondTypeId._id": { $in: [...output] } };
		}

		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		//searchQuery
		if (searchQuery) {
			query["$or"] = [
				{
					title: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					rank: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		// let sortObject = { [amount]: order === "DESC" ? -1 : 1 };
		// if (sort === "price") {
		// 	sortObject = { ["diamondTypeId.price"]: order === "DESC" ? -1 : 1 };
		// }
		const result = await Prize.aggregate([
			{
				$lookup: {
					from: "diamondTypes",
					localField: "diamondTypeId",
					foreignField: "_id",
					as: "diamondTypeId",
				},
			},
			{ $unwind: { path: "$diamondTypeId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "assets",
					localField: "assetId",
					foreignField: "_id",
					as: "assetId",
				},
			},
			{ $unwind: { path: "$assetId", preserveNullAndEmptyArrays: true } },
			{ $sort: { amount: -1 } },
			{ $match: query },
			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]).collation({ locale: "en" });

		const items = result[0].data;
		const metadata = result[0].metadata[0];

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});
	});
}

function getPrize(id) {
	return new Promise(async (resolve, reject) => {
		let prize = await Prize.findOne({ _id: id, deletedAt: null })
			.populate({ path: "diamondTypeId" })
			.populate({ path: "assetId" });

		if (!prize) return reject(new NotFoundError("Prize not found", 400));

		return resolve(prize);
	});
}

function addPrize(data) {
	return new Promise(async (resolve, reject) => {
		const { diamondTypeId, rank, amount, assetId, title } = data;

		// const asset = await Asset.findOne({_id: assetId});
		// if (!asset) return new HumanError("the asset does not exist", 400);
		//
		// const diamondType = await DiamondType.findOne({_id: diamondTypeId});
		// if (!diamondType) return new HumanError("the diamondType does not exist", 400);

		await Prize.create({ title, diamondTypeId, rank, amount, assetId });

		return resolve("success");
	});
}

function editPrize(id, data) {
	return new Promise(async (resolve, reject) => {
		const { title, tier, amount, assetId, diamondTypeId } = data;
		const asset = await Asset.findOne({ _id: assetId });
		if (!asset) return new HumanError("the asset does not exist", 400);

		const diamondType = await DiamondType.findOne({ _id: diamondTypeId });
		if (!diamondType) return new HumanError("the diamondType does not exist", 400);

		let update = {};

		if (title) update.title = title;
		if (tier) update.tier = tier;
		if (amount) update.amount = amount;
		if (assetId) update.assetId = assetId;
		if (diamondTypeId) update.cardTypeId = diamondTypeId;

		const result = await Prize.findByIdAndUpdate(id, update);

		return resolve("success");
	});
}

function deletePrize(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Prize.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } });

		return resolve("Successful");
	});
}

module.exports = {
	getPrizes,
	getPrize,
	addPrize,
	editPrize,
	deletePrize,
};

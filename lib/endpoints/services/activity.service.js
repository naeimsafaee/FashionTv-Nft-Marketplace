const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { UserActivity } = require("../../databases/mongodb");
const ObjectId = require("mongoose").Types.ObjectId;

const exactMath = require("exact-math");

async function getOneActivityByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await UserActivity.findById(id)
			.populate("from", "-__v")
			.populate("to", "-__v")
			.populate("assignTokenId", "-__v")
			.populate({
				path: "collectionId",
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_ACTIVITY_NOT_FOUND.MESSAGE, Errors.USER_ACTIVITY_NOT_FOUND.CODE, { id }),
			);

		return resolve(result);
	});
}

function getAllActivityByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, type, collectionId, assignTokenId, price, quantity, createdAt } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {};
		if (type) {
			if (!isJson(type)) {
				return reject(new HumanError(Errors.INVALID_ACTIVITY_TYPE.MESSAGE, Errors.INVALID_ACTIVITY_TYPE.CODE));
			}
			query.type = { $in: JSON.parse(type) };
		}
		if (collectionId) query.collectionId = collectionId;
		if (assignTokenId) query.assignTokenId = assignTokenId;
		if (price) query.price = { $gte: Number(price) };
		if (quantity) query.quantity = { $gte: Number(quantity) };
		if (createdAt) {
			query.createdAt = { $gte: createdAt };
		}
		const count = await UserActivity.countDocuments(query);
		const items = await UserActivity.find(query)
			.populate("from", "-__v")
			.populate("to", "-__v")
			.populate({ path: "assignTokenId", select: "-__v", populate: { path: "tokenId", select: "-__v" } })
			.populate({
				path: "collectionId",
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: items,
		});
	});
}

function activitySelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, searchQuery } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {};

		if (searchQuery) {
			query["$or"] = [
				{
					"from.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"to.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"collectionId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"assignTokenId.tokenId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const count = await UserActivity.countDocuments(query);
		const result = await UserActivity.find(query)
			.populate("from", "-__v")
			.populate("to", "-__v")
			.populate({ path: "assignTokenId", select: "-__v", populate: { path: "tokenId", select: "-__v" } })
			.populate({
				path: "collectionId",
				populate: {
					path: "category",
					match: { deletedAt: null },
				},
			})
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: result,
		});
	});
}

function getPriceHistory(data) {
	return new Promise(async (resolve, reject) => {
		const { from, to, id } = data;

		const query = {
			type: "SALE",
			tokenId: ObjectId(id),
			$and: [
				{
					createdAt: { $gte: from },
				},
				{
					createdAt: { $lte: to },
				},
			],
		};

		const result = await UserActivity.find(query).select("price createdAt").sort({ createdAt: -1 }).lean();

		const filtered = [];
		result.forEach((p) => {
			const foundedPriceIndex = filtered.findIndex(
				(f) =>
					f.createdAt.getDate() === p.createdAt.getDate() &&
					f.createdAt.getMonth() === p.createdAt.getMonth() &&
					f.createdAt.getFullYear() === p.createdAt.getFullYear(),
			);

			if (foundedPriceIndex !== -1) {
				filtered[foundedPriceIndex].price = exactMath.add(filtered[foundedPriceIndex].price, p.price);
				filtered[foundedPriceIndex].count++;
				filtered[foundedPriceIndex].avg = exactMath.div(
					filtered[foundedPriceIndex].price,
					filtered[foundedPriceIndex].count,
				);
			} else filtered.push({ ...p, count: 1 });
		});

		resolve({
			data: filtered,
		});
	});
}

module.exports = {
	getOneActivityByManager,
	getAllActivityByManager,
	activitySelectorByManager,
	getPriceHistory,
};

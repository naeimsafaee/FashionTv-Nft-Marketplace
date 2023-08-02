const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { Subscribe } = require("../../databases/mongodb");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

function addSubscribe(email) {
	return new Promise(async (resolve, reject) => {
		const existSubscribe = await Subscribe.findOne({ deletedAt: null, email });
		if (existSubscribe) {
			return reject(new HumanError(Errors.DUPLICATE_SUBSCRIBE.MESSAGE, Errors.DUPLICATE_SUBSCRIBE.CODE));
		}

		const result = await Subscribe.create({ email });

		if (!result) return reject(new HumanError(Errors.SUBSCRIBE_FAILED.MESSAGE, Errors.SUBSCRIBE_FAILED.CODE));

		resolve("Successful");
	});
}

function deleteSubscribe(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Subscribe.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: { deletedAt: new Date() } },
		);

		if (!result)
			return reject(
				new NotFoundError(Errors.SUBSCRIBE_NOT_FOUND.MESSAGE, Errors.SUBSCRIBE_NOT_FOUND.CODE, { id }),
			);

		return resolve("Successful");
	});
}

async function getOneSubscribe(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Subscribe.findOne({ _id: id, deletedAt: null }).lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.SUBSCRIBE_NOT_FOUND.MESSAGE, Errors.SUBSCRIBE_NOT_FOUND.CODE, { id }),
			);

		return resolve(result);
	});
}

function getAllSubscribe(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, email, searchQuery, createdAt } = data;

		const query = {
			deletedAt: null,
		};

		if (searchQuery) {
			query.email = {
				$regex: searchQuery || "",
				$options: "i",
			};
		}

		if (email) {
			query.email = {
				$regex: email || "",
				$options: "i",
			};
		}

		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		const count = await Subscribe.countDocuments(query);
		const items = await Subscribe.find(query)
			.select("-__v")
			.sort({ [sort]: order })
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

module.exports = {
	addSubscribe,
	deleteSubscribe,
	getOneSubscribe,
	getAllSubscribe,
};

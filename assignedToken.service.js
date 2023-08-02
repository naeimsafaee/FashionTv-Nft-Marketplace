const { NotFoundError, HumanError } = require("./errorhandler/Index");
const Errors = require("./errorhandler/MessageText");
const { UserAssignedToken } = require("./../databases/mongodb");

async function getOneAssignedTokenByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await UserAssignedToken.findById(id)
			.populate("userId", "-__v")
			.populate("tokenId", "-__v")
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
				new NotFoundError(
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.MESSAGE,
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.CODE,
					{ id },
				),
			);

		return resolve(result);
	});
}

function getAllAssignedTokenByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, userId, tokenId, collectionId, status, createdAt } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {};
		if (userId) query.userId = userId;
		if (tokenId) query.tokenId = tokenId;
		if (collectionId) query.collectionId = collectionId;
		if (status) {
			if (!isJson(status)) {
				return reject(
					new HumanError(
						Errors.INVALID_ASSIGNED_TOKEN_STATUS.MESSAGE,
						Errors.INVALID_ASSIGNED_TOKEN_STATUS.CODE,
					),
				);
			}
			query.status = { $in: JSON.parse(status) };
		}

		if (createdAt) {
			query.createdAt = { $gte: createdAt };
		}
		const count = await UserAssignedToken.countDocuments(query);
		const items = await UserAssignedToken.find(query)
			.populate("userId", "-__v")
			.populate("tokenId", "-__v")
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

function assignedTokenSelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, searchQuery } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {};

		if (searchQuery) {
			query["$or"] = [
				{
					"userId.username": {
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
					"tokenId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const count = await UserAssignedToken.countDocuments(query);
		const result = await UserAssignedToken.find(query)
			.populate("userId", "-__v")
			.populate("tokenId", "-__v")
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

module.exports = {
	getOneAssignedTokenByManager,
	getAllAssignedTokenByManager,
	assignedTokenSelectorByManager,
};

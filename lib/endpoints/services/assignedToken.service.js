const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { UserAssignedToken } = require("../../databases/mongodb");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

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
		const { page, limit, order, sort, status, createdAt, name, chain, user, collection, searchQuery } = data;
		const query = {
			deletedAt: null,
			"userId.deletedAt": null,
			"tokenId.deletedAt": null,
		};

		// Assigned Token
		if (status) {
			query.status = { $in: status };
		}

		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		// Token
		if (name) {
			query["tokenId.name"] = {
				$regex: name || "",
				$options: "i",
			};
		}

		if (chain) {
			query["tokenId.chain"] = {
				$in: chain,
			};
		}

		// User
		if (user) {
			query["$or"] = [
				{
					"userId.address": {
						$regex: user || "",
						$options: "i",
					},
				},
				{
					"userId.username": {
						$regex: user || "",
						$options: "i",
					},
				},
			];
		}

		// Collection
		if (collection) {
			query["collectionId.name"] = {
				$regex: collection || "",
				$options: "i",
			};
		}

		if (searchQuery) {
			query["$or"] = [
				{
					"tokenId.name": {
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
					"userId.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"userId.address": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		let sortKey = sort;
		if (sort === "status") sortKey = "status";
		if (sort === "name") sortKey = "tokenId.name";
		if (sort === "chain") sortKey = "tokenId.chain";
		if (sort === "image") sortKey = "tokenId.image";
		if (sort === "user") sortKey = "userId.address";
		if (sort === "collection") sortKey = "collectionId.name";
		if (sort === "collectionImage") sortKey = "collectionId.image";

		const result = await UserAssignedToken.aggregate([
			{
				$lookup: {
					from: "userTokens",
					localField: "tokenId",
					foreignField: "_id",
					as: "tokenId",
				},
			},
			{ $unwind: "$tokenId" },
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userId",
				},
			},
			{ $unwind: "$userId" },
			{
				$lookup: {
					from: "userCollections",
					localField: "collectionId",
					foreignField: "_id",
					as: "collectionId",
				},
			},
			{ $unwind: "$collectionId" },
			{ $match: query },
			{ $sort: { [sortKey]: order === "DESC" ? -1 : 1 } },
			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]);

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

function assignedTokenSelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, searchQuery, status } = data;
		const query = {
			deletedAt: null,
			"userId.deletedAt": null,
		};

		// filters
		if (status) {
			query.status = { $in: status };
		}
		// searchQuery
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

		let sortKey = sort;
		if (sort === "status") sortKey = "status";

		const result = await UserAssignedToken.aggregate([
			{
				$lookup: {
					from: "userTokens",
					localField: "tokenId",
					foreignField: "_id",
					as: "tokenId",
				},
			},
			{ $unwind: "$tokenId" },
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userId",
				},
			},
			{
				$lookup: {
					from: "userCollections",
					localField: "collectionId",
					foreignField: "_id",
					as: "collectionId",
				},
			},
			{ $unwind: "$collectionId" },
			{
				$lookup: {
					from: "categories",
					localField: "collectionId.category",
					foreignField: "_id",
					as: "collectionId.categoryId",
				},
			},
			//{ $unwind: "$collectionId.categoryId" },
			{ $match: query },
			{ $sort: { [sortKey]: order === "DESC" ? -1 : 1 } },
			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]);

		const items = result[0].data;
		const metadata = result[0].metadata[0];

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});

		// const count = await UserAssignedToken.countDocuments(query);
		// const result = await UserAssignedToken.find(query)
		// 	.populate("userId", "-__v")
		// 	.populate("tokenId", "-__v")
		// 	.populate({
		// 		path: "collectionId",
		// 		populate: {
		// 			path: "category",
		// 			match: { deletedAt: null },
		// 		},
		// 	})
		// 	.select("-__v")
		// 	.sort(sortObj)
		// 	.skip((page - 1) * limit)
		// 	.limit(limit)
		// 	.lean();

		// resolve({
		// 	total: count ?? 0,
		// 	pageSize: limit,
		// 	page,
		// 	data: result,
		// });
	});
}

module.exports = {
	getOneAssignedTokenByManager,
	getAllAssignedTokenByManager,
	assignedTokenSelectorByManager,
};

const { NotFoundError, HumanError, ConflictError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const mongoose = require("mongoose");
const {
	Category,
	UserCollection,
	UserToken,
	UserExplore,
	UserCollectionStats,
	UserActivity,
	ManagerNotification,
	UserCategory,
	UserFollowLike,
} = require("../../databases/mongodb");
const { isJson } = require("../../utils");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");
const ObjectId = require("mongoose").Types.ObjectId;

function addUserCollection(name, description, category, links, explicitContent, files, user, fileValidationError) {
	return new Promise(async (resolve, reject) => {
		const existCollection = await UserCollection.findOne({ deletedAt: null, name });
		if (existCollection) {
			return reject(
				new HumanError(Errors.DUPLICATE_COLLECTION.MESSAGE, Errors.DUPLICATE_COLLECTION.CODE, { name }),
			);
		}

		if (fileValidationError) {
			return reject(
				new ConflictError(Errors.FILE_NOT_SUPPORTED.MESSAGE, Errors.FILE_NOT_SUPPORTED.CODE, {
					fileValidationError,
				}),
			);
		}
		let data = {};

		if (files) {
			for (let key in files) {
				let file = files[key].shift();

				data[key] = [
					{
						name: file.newName,
						key: file.key,
						location: file.location,
					},
				];
			}
		}
		if (category) {
			if (typeof category == "object") {
				category = category.toString().split(",");
			}
			for (let i = 0; i < category.length; i++) {
				const cat = category[i];
				const thisCategory = await Category.findOne({ _id: cat, deletedAt: null });
				if (!thisCategory)
					return reject(new HumanError(Errors.CATEGORY_NOT_FOUND.MESSAGE, Errors.CATEGORY_NOT_FOUND.CODE));
			}
		}

		if (links) {
			if (!isJson(links)) {
				return reject(new ConflictError(Errors.INVALID_LINK.MESSAGE, Errors.INVALID_LINK.CODE));
			}
		}

		const result = await UserCollection.create({
			user: user.id,
			name,
			description,
			category,
			links: links ? JSON.parse(links) : null,
			explicitContent,
			...data,
		});

		if (!result)
			return reject(new HumanError(Errors.USER_COLLECTION_FAILED.MESSAGE, Errors.USER_COLLECTION_FAILED.CODE));

		// for (let i = 0; i < category.length; i++) {
		//     await UserCategory.create({
		//         UserCollection: result._id,
		//         category: category[i]
		//     });
		// }

		//save collection name in explorers table
		const collectionImage = result.image.length > 0 ? result.image[0].location : null;
		await UserExplore.create({
			name,
			type: "COLLECTIONS",
			typeId: result.id,
			collectionImage: collectionImage,
		});

		await ManagerNotification.create({
			title: `New Collection ${name} has been added`,
			type: "COLLECTION_CREATED",
			body: {
				collection: result.id,
			},
		});

		resolve({ data: result });
	});
}

function editUserCollection(id, name, description, category, links, explicitContent, files, user, fileValidationError) {
	return new Promise(async (resolve, reject) => {
		if (fileValidationError) {
			return reject(
				new ConflictError(Errors.FILE_NOT_SUPPORTED.MESSAGE, Errors.FILE_NOT_SUPPORTED.CODE, {
					fileValidationError,
				}),
			);
		}
		let update = {};
		if (files) {
			for (let key in files) {
				let file = files[key].shift();

				update[key] = [
					{
						name: file.newName,
						key: file.key,
						location: file.location,
					},
				];
			}
		}

		const existCollection = await UserCollection.findOne({ name, _id: { $ne: id }, deletedAt: null });
		if (existCollection) {
			return reject(
				new HumanError(Errors.DUPLICATE_COLLECTION.MESSAGE, Errors.DUPLICATE_COLLECTION.CODE, { name }),
			);
		}

		if (name) update.name = name;
		if (description) update.description = description;
		if (category) update.category = category;
		if (explicitContent) update.explicitContent = explicitContent;

		if (links) {
			if (!isJson(links)) {
				return reject(new ConflictError(Errors.INVALID_LINK.MESSAGE, Errors.INVALID_LINK.CODE));
			}
			update.links = JSON.parse(links);
		}

		if (category) {
			if (typeof category == "object") {
				category = category.toString().split(",");
			}
			for (let i = 0; i < category.length; i++) {
				const cat = category[i];
				const thisCategory = await Category.findOne({ _id: cat, deletedAt: null });
				if (!thisCategory)
					return reject(new HumanError(Errors.CATEGORY_NOT_FOUND.MESSAGE, Errors.CATEGORY_NOT_FOUND.CODE));
			}
			update.category = category;
		}

		// if (category) {
		//     const thisCategory = await Category.findOne({_id: category, deletedAt: null});
		//     if (!thisCategory)
		//         return reject(new NotFoundError(Errors.CATEGORY_NOT_FOUND.MESSAGE, Errors.CATEGORY_NOT_FOUND.CODE));
		//     update.category = category;
		// }

		const result = await UserCollection.findOneAndUpdate({ _id: id, user: user.id }, update);

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_COLLECTION_NOT_FOUND.MESSAGE, Errors.USER_COLLECTION_NOT_FOUND.CODE, {
					id,
				}),
			);

		//update collection name in explorers table
		let exploreUpdate = {};
		if (name) exploreUpdate.name = name;
		if (update.image) exploreUpdate.collectionImage = result.image[0].location;

		if (name || update.image)
			await UserExplore.findOneAndUpdate({ type: "COLLECTIONS", typeId: result.id }, exploreUpdate);

		return resolve("Successful");
	});
}

function deleteUserCollection(id, user) {
	return new Promise(async (resolve, reject) => {
		const result = await UserCollection.findOneAndUpdate(
			{ _id: id, user: user.id },
			{ $set: { deletedAt: new Date() } },
		);

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_COLLECTION_NOT_FOUND.MESSAGE, Errors.USER_COLLECTION_NOT_FOUND.CODE, {
					id,
				}),
			);

		// delete collection from explorers
		await UserExplore.findOneAndUpdate({ type: "COLLECTIONS", typeId: result.id }, { deletedAt: new Date() });

		return resolve("Successful");
	});
}

function getUserCollection(id, user) {
	return new Promise(async (resolve, reject) => {
		const result = await UserCollection.findOne({ _id: id, deletedAt: null })
			.populate({
				path: "category",
				match: { deletedAt: null },
			})
			.lean();

		const tokens = await UserToken.find({ collectionId: result._id }).lean();
		for (let i = 0; i < tokens.length; i++) {
			let is_liked = false;
			if (user) {
				let like = await UserFollowLike.findOne({
					userId: user._id,
					likedToken: new ObjectId(tokens[i].tokenId),
				});
				if (like) is_liked = true;
			}
			tokens[i].is_liked = is_liked;
		}

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_COLLECTION_NOT_FOUND.MESSAGE, Errors.USER_COLLECTION_NOT_FOUND.CODE, {
					id,
				}),
			);

		return resolve({ ...result, tokens });
	});
}

function getUserCollections(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, createdAt, user, category, sort, searchQuery } = data;
		let query = {};

		const sortObj = {};
		if (user) query = { "user._id": mongoose.Types.ObjectId(user) };
		sortObj[sort || "createdAt"] = order;
		if (category) query.category = category;
		if (createdAt) {
			query.createdAt = { $gte: createdAt };
		}
		let created = {};
		if (order == "DESC") {
			created.createdAt = -1;
		} else if (order == "ASC") {
			created.createdAt = +1;
		}

		const result = await UserCollection.aggregate([
			{
				$lookup: {
					from: "categories",
					localField: "category",
					foreignField: "_id",
					as: "category",
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $match: { $and: [query, { deletedAt: null }] } },
			{ $sort: created },
			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]).collation({ locale: "en" });

		const items = result[0].data;
		const metadata = result[0].metadata[0];

		const output = await Promise.all(
			items.map(async (item) => {
				const thisTokens = await UserToken.find({ collectionId: item.collectionId }).lean();
				return {
					...item,
					tokens: thisTokens,
				};
			}),
		);

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: output,
		});
		// const count = await UserCollection.countDocuments(query);
		// const items = await UserCollection.find(query)
		// 	.populate({
		// 		path: "category",
		// 		match: { deletedAt: null },
		// 	})
		// 	.populate("user")
		// 	.select("-__v")
		// 	.sort({createdAt:order})
		// 	.skip((page - 1) * limit)
		// 	.limit(limit)
		// 	.lean(); // == raw: true

		// for (let i = 0; i < items.length; i++) {
		// 	const thisTokens = await UserToken.find({ collectionId: items[i].collectionId }).lean();
		// 	items[i].tokens = thisTokens;
		// }

		// resolve({
		// 	total: count ?? 0,
		// 	pageSize: limit,
		// 	page,
		// 	data: items,
		// });
	});
}

function userCollectionSelector(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, description, name, searchQuery } = data;
		let sort = {};
		let query = { "category.deletedAt": null };

		//UserCollection filter
		if (name) {
			query.name = new RegExp(name, "i");
		}
		// if (description) {
		//     query.description = new RegExp(description, "i");
		// }

		//sort
		if (order == "DESC") {
			sort.createdAt = -1;
		} else if (order == "ASC") {
			sort.createdAt = +1;
		}

		// if (category_deletedAt) {
		//     query = { "category.deletedAt": null };
		// }
		//searchQuery
		if (searchQuery) {
			query["$or"] = [
				{
					"user.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"user.address": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"category.title": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					name: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const result = await UserCollection.aggregate([
			{
				$lookup: {
					from: "categories",
					localField: "category",
					foreignField: "_id",
					as: "category",
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $match: query },
			{ $sort: sort },
			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]).collation({ locale: "en" });

		const items = result[0].data;
		const metadata = result[0].metadata[0];

		const output = await Promise.all(
			items.map(async (item) => {
				const thisTokens = await UserToken.find({ collectionId: item.collectionId }).lean();
				return {
					...item,
					tokens: thisTokens,
				};
			}),
		);

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: output,
		});
	});
}

function customCollection(page, limit, order, sort, searchQuery) {
	return new Promise(async (resolve, reject) => {
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
		};
		if (searchQuery) {
			query["$or"] = [
				{
					name: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					description: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}
		const count = await UserCollection.countDocuments(query);
		const result = await UserCollection.find(query)
			.populate({
				path: "category",
				match: { deletedAt: null },
			})
			.select("-__v")
			.populate("user")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(); // == raw: true

		for (let i = 0; i < result.length; i++) {
			const details = await UserCollectionStats.findOne({
				collectionId: result[i]._id,
				type: "ALL",
			}).lean();
			result[i].detail = {
				volume: details ? details.volume : 0,
				floorPrice: details ? details.floorPrice : 0,
				owners: details ? details.owners : 0,
				items: details ? details.items : 0,
			};
			result[i].tokens = await UserToken.find({ collectionId: result[i]._id }).limit(limit).lean();
		}

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: result,
		});
	});
}

function getUserCollectionByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await UserCollection.findOne({ _id: id })
			.populate({
				path: "category",
				match: { deletedAt: null },
			})
			.populate("user")

			.lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.USER_COLLECTION_NOT_FOUND.MESSAGE, Errors.USER_COLLECTION_NOT_FOUND.CODE, {
					id,
				}),
			);

		return resolve(result);
	});
}

function getUserCollectionsByManager(data) {
	return new Promise(async (resolve, reject) => {
		const {
			page,
			limit,
			order,
			sort,
			searchQuery,
			isFeatured,
			isVerified,
			isExplorer,
			user_name,
			user_address,
			name,
			createdAt,
		} = data;

		let query = {
			deletedAt: null,
		};

		if (isFeatured) query.isFeatured = { $in: isFeatured.map((flag) => (flag === "true" ? true : false)) };
		if (isExplorer) query.isExplorer = { $in: isExplorer.map((flag) => (flag === "true" ? true : false)) };
		if (isVerified) query.isVerified = { $in: isVerified.map((flag) => (flag === "true" ? true : false)) };

		if (name) {
			query.name = new RegExp(name, "i");
		}

		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		//user filters
		if (user_name) {
			query = { "user.username": new RegExp(user_name, "i") };
		}
		if (user_address) {
			query = { "user.address": new RegExp(user_address, "i") };
		}
		//searchQuery
		if (searchQuery) {
			query["$or"] = [
				{
					"user.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"user.address": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					name: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					type: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		let sortObject = { [sort]: order === "DESC" ? -1 : 1 };
		if (sort === "user") {
			sortObject = { ["user.username"]: order === "DESC" ? -1 : 1 };
		}

		const result = await UserCollection.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $unwind: "$user" },
			{ $match: query },
			{ $sort: sortObject },
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

function userCollectionSelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, description, name, createdAt } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		let query = { "category.deletedAt": null };

		if (name) {
			query.name = new RegExp(name, "i");
		}
		if (description) {
			query.description = new RegExp(description, "i");
		}

		if (category_deletedAt) {
			query = { "category.deletedAt": null };
		}

		const result = await UserCollection.aggregate([
			{
				$lookup: {
					from: "categories",
					localField: "category",
					foreignField: "_id",
					as: "category",
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "user",
					foreignField: "_id",
					as: "user",
				},
			},
			{ $match: query },
			{ $sort: sortObject },
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
		// if (searchQuery) {
		//     query["$or"] = [
		//         {
		//             name: {
		//                 $regex: searchQuery || "",
		//                 $options: "i",
		//             },
		//         },
		//         {
		//             description: {
		//                 $regex: searchQuery || "",
		//                 $options: "i",
		//             },
		//         },
		//     ];
		// }
		// const count = await UserCollection.countDocuments(query);
		// const result = await UserCollection.find(query)
		//     .populate({
		//         path: "category",
		//         match: {deletedAt: null},
		//     })
		//     .populate("user")

		//     .select("-__v")
		//     .sort(sortObj)
		//     .skip((page - 1) * limit)
		//     .limit(limit)
		//     .lean(); // == raw: true

		// resolve({
		//     total: count ?? 0,
		//     pageSize: limit,
		//     page,
		//     data: result,
		// });
	});
}

function editUserCollectionByManager(id, isFeatured, isVerified, isExplorer) {
	return new Promise(async (resolve, reject) => {
		const thisCollcetion = await UserCollection.findOne({ _id: new ObjectId(id), deletedAt: null });

		if (!thisCollcetion) {
			return reject(
				new NotFoundError(Errors.USER_COLLECTION_NOT_FOUND.MESSAGE, Errors.USER_COLLECTION_NOT_FOUND.CODE),
			);
		}

		thisCollcetion.isFeatured = isFeatured;
		thisCollcetion.isVerified = isVerified;
		thisCollcetion.isExplorer = isExplorer;

		await thisCollcetion.save();
		return resolve("Successful");
	});
}

/**
 * get token or colection user activity
 * @param {*} collectionId
 * @param {*} tokenId
 * @param {*} page
 * @param {*} limit
 * @returns
 */
function userActivity(data) {
	const { page, limit, sort, order, collectionId, tokenId, from, to } = data;
	return new Promise(async (resolve, reject) => {
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
			$or: [],
		};

		if (collectionId) query["$or"].push({ collectionId });
		if (tokenId) query["$or"].push({ tokenId });
		if (from) query["$or"].push({ from });
		if (to) query["$or"].push({ to });

		const count = await UserActivity.countDocuments(query);
		const items = await UserActivity.find(query)
			.populate("from", "_id username address image")
			.populate("to", "_id username address image")

			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(); // == raw: true

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: items,
		});
	});
}

module.exports = {
	addUserCollection,
	editUserCollection,
	deleteUserCollection,
	getUserCollection,
	getUserCollections,
	userCollectionSelector,
	getUserCollectionByManager,
	getUserCollectionsByManager,
	userCollectionSelectorByManager,
	customCollection,
	editUserCollectionByManager,
	userActivity,
};

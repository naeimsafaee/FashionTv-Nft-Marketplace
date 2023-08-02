const { NotFoundError, HumanError, ConflictError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { Category } = require("../../databases/mongodb");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

async function addCategory(title, description, type, files) {
	return new Promise(async (resolve, reject) => {
		let imagesData = { dark: null, light: null };
		if (files) {
			for (let key in files) {
				let file = files[key].shift();
				imagesData[key] = [
					{
						name: file.newName,
						key: file.key,
						location: file.location,
					},
				];
			}
		}

		const existCategory = await Category.findOne({ title, deletedAt: null });
		if (existCategory) {
			return reject(
				new ConflictError(Errors.DUPLICATE_CATEGORY.MESSAGE, Errors.DUPLICATE_CATEGORY.CODE, {
					title,
				}),
			);
		}

		await Category.create({
			icon: { ...imagesData },
			...(title && { title: title }),
			...(type && { type: type }),
			...(description && { description: description }),
		});

		resolve("Successful");
	});
}

async function editCategory(id, title, description, type, files) {
	return new Promise(async (resolve, reject) => {
		let imagesData = { dark: null, light: null };
		if (files) {
			for (let key in files) {
				let file = files[key].shift();
				imagesData[key] = [
					{
						name: file.newName,
						key: file.key,
						location: file.location,
					},
				];
			}
		}

		const existCategory = await Category.findOne({ title, deletedAt: null, _id: { $ne: id } });
		if (existCategory) {
			return reject(
				new ConflictError(Errors.DUPLICATE_CATEGORY.MESSAGE, Errors.DUPLICATE_CATEGORY.CODE, {
					title,
				}),
			);
		}

		const result = await Category.findOneAndUpdate(
			{ _id: id },
			{
				icon: { ...imagesData },
				...(title && { title: title }),
				...(type && { type: type }),
				...(description && { description: description }),
			},
		);

		if (!result)
			return reject(new NotFoundError(Errors.CATEGORY_NOT_FOUND.MESSAGE, Errors.CATEGORY_NOT_FOUND.CODE, { id }));

		resolve("Successful");
	});
}

function deleteCategory(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Category.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: { deletedAt: new Date() } },
		);

		if (!result)
			return reject(new NotFoundError(Errors.CATEGORY_NOT_FOUND.MESSAGE, Errors.CATEGORY_NOT_FOUND.CODE, { id }));

		resolve("Successful");
	});
}

async function getCategory(id) {
	return new Promise(async (resolve, reject) => {
		const category = await Category.findOne({ _id: id, deletedAt: null });

		if (!category)
			return reject(new NotFoundError(Errors.CATEGORY_NOT_FOUND.MESSAGE, Errors.CATEGORY_NOT_FOUND.CODE, { id }));

		resolve(category);
	});
}
function getCategories(page, limit, order, sort, title, description, createdAt, type) {
	return new Promise(async (resolve, reject) => {
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
			type: "COLLECTION",
		};

		if (type) {
			query.type = type;
		}

		if (title)
			query.title = {
				$regex: title || "",
				$options: "i",
			};
		if (description)
			query.description = {
				$regex: description || "",
				$options: "i",
			};
		if (createdAt) {
			query.createdAt = { $gte: createdAt };
		}
		const count = await Category.countDocuments(query);
		const items = await Category.find(query)
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

function categorySelector(page, limit, order, sort, searchQuery) {
	return new Promise(async (resolve, reject) => {
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
			type: "COLLECTION",
		};
		if (searchQuery) {
			query["$or"] = [
				{
					title: {
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

		const count = await Category.countDocuments(query);
		const result = await Category.find(query)
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean(); // == raw: true

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: result,
		});
	});
}

async function getCategoryByManager(id) {
	return new Promise(async (resolve, reject) => {
		const category = await Category.findOne({ _id: id, deletedAt: null });
		resolve(category);
	});
}
function getCategoriesByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, title, type, createdAt, searchQuery } = data;
		const query = { deletedAt: null };
		const sort = {};

		// category filters
		if (title) {
			query.title = new RegExp(title, "i");
		}
		if (type) {
			query.type = { $in: [...type] };
		}
		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		//sort
		if (order == "DESC") {
			sort.createdAt = -1;
		} else if (order == "ASC") {
			sort.createdAt = +1;
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
					type: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const result = await Category.aggregate([
			{ $sort: sort },
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

function categorySelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, title, description, searchQuery } = data;
		const query = { deletedAt: null };
		const createdAt = {};

		// category filters
		if (title) {
			query.title = new RegExp(title, "i");
		}
		if (description) {
			query.description = new RegExp(description, "i");
		}

		//sort
		if (order == "DESC") {
			createdAt.createdAt = -1;
		} else if (order == "ASC") {
			createdAt.createdAt = +1;
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
					description: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const result = await Category.aggregate([
			{ $sort: createdAt },
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

module.exports = {
	addCategory,
	editCategory,
	deleteCategory,
	getCategory,
	getCategories,
	categorySelector,
	getCategoriesByManager,
	categorySelectorByManager,
	getCategoryByManager,
};

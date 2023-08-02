const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { Blog, Category } = require("../../databases/mongodb");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

function addBlog(status, category, title, text, description, files, isHome, video, type) {
	return new Promise(async (resolve, reject) => {
		let data = { images: null, thumbnails: null };

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

		// Check IF Category type is BLOG ?
		// Force Category ?

		if (category) {
			const thisCategory = await Category.findById(category);
			if (!thisCategory)
				return reject(new HumanError(Errors.CATEGORY_NOT_FOUND.MESSAGE, Errors.CATEGORY_NOT_FOUND.CODE));
		}

		const existTitle = await Blog.findOne({ title, deletedAt: null });
		if (existTitle) {
			return reject(new HumanError(Errors.BLOG_TITLE_DUPLICATE.MESSAGE, Errors.BLOG_TITLE_DUPLICATE.CODE));
		}

		const result = await Blog.create({
			status,
			text,
			category,
			title,
			slug: title
				.replace(/\s+/g, "-")
				.replace(/[^\w\-]+/g, "")
				.replace(/\-\-+/g, "-")
				.replace(/^-+/, "")
				.replace(/-+$/, "")
				.toLowerCase(),
			description,
			isHome,
			video,
			type,
			...data,
		});

		if (!result) return reject(new HumanError(Errors.BLOG_FAILED.MESSAGE, Errors.BLOG_FAILED.CODE));

		resolve("Successful");
	});
}

function editBlog(id, title, description, text, images, thumbnails, category, status, files, isHome, video, type) {
	return new Promise(async (resolve, reject) => {
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
		if (category) {
			const thisCategory = await Category.findById(category);

			if (!thisCategory)
				return reject(new NotFoundError(Errors.CATEGORY_NOT_FOUND.MESSAGE, Errors.CATEGORY_NOT_FOUND.CODE));
			update.category = category;
		}

		if (status) update.status = status;

		if (text) update.text = text;

		if (title) {
			const existTitle = await Blog.findOne({ title, _id: { $ne: id }, deletedAt: null });
			if (existTitle) {
				return reject(new HumanError(Errors.BLOG_TITLE_DUPLICATE.MESSAGE, Errors.BLOG_TITLE_DUPLICATE.CODE));
			}
			update.title = title;
			update.slug = title
				.replace(/\s+/g, "-")
				.replace(/[^\w\-]+/g, "")
				.replace(/\-\-+/g, "-")
				.replace(/^-+/, "")
				.replace(/-+$/, "")
				.toLowerCase();
		}

		if (video) update.video = video;

		if (typeof isHome === "boolean") update.isHome = isHome;

		if (description) update.description = description;

		if (images === "null") update.images = null;

		if (thumbnails === "null") update.thumbnails = null;

		if (type) update.type = type;

		const result = await Blog.findByIdAndUpdate(id, update);

		if (!result)
			return reject(new NotFoundError(Errors.BLOG_NOT_FOUND.MESSAGE, Errors.BLOG_NOT_FOUND.CODE, { id }));

		return resolve("Successful");
	});
}

function deleteBlog(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Blog.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } });

		if (!result)
			return reject(new NotFoundError(Errors.BLOG_NOT_FOUND.MESSAGE, Errors.BLOG_NOT_FOUND.CODE, { id }));

		return resolve("Successful");
	});
}
async function getBlog(slug) {
	return new Promise(async (resolve, reject) => {
		const result = await Blog.findOne({ slug, status: "ACTIVE", deletedAt: null })
			.populate({
				path: "category",
				match: { deletedAt: null },
			})
			.lean();

		if (!result)
			return reject(new NotFoundError(Errors.BLOG_NOT_FOUND.MESSAGE, Errors.BLOG_NOT_FOUND.CODE, { slug }));

		const similiars = await Blog.find({
			deletedAt: null,
			status: "ACTIVE",
			type: result.type,
			category: result.category._id,
			_id: { $ne: result._id },
		})
			.limit(10)
			.sort({ createdAt: -1 });

		return resolve({ ...result, similiars });
	});
}
function getBlogs(data) {
	return new Promise(async (resolve, reject) => {
		let { page, limit, id, category, type, order, isHome } = data;

		const query = { status: "ACTIVE", deletedAt: null /* type: { $nin: ["ABOUT", "FAQ"] } */ };
		if (id) query._id = id;
		if (category) query.category = category;
		if (type) query.type = type;

		if (isHome === true) query.isHome = true;
		if (isHome === false) query.isHome = false;

		const count = await Blog.countDocuments(query);
		const items = await Blog.find(query)
			.populate({
				path: "category",
				match: { deletedAt: null },
			})
			.select("-__v")
			.sort({ createdAt: order })
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

function recommendedBlogs() {
	return new Promise(async (resolve, reject) => {
		const items = await Blog.aggregate([
			{ $sample: { size: 5 } },
			{ $match: { deletedAt: null, status: "ACTIVE", type: "FAQ" } },
		]);

		await Category.populate(items, { path: "category", select: "_id icon title description type" });

		resolve({
			data: items,
		});
	});
}

function likeBlog(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Blog.findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true });

		if (!result)
			return reject(new NotFoundError(Errors.BLOG_NOT_FOUND.MESSAGE, Errors.BLOG_NOT_FOUND.CODE, { id }));

		return resolve(result);
	});
}

function blogSelector(page, limit, order, searchQuery, type, category) {
	return new Promise(async (resolve, reject) => {
		const query = { status: "ACTIVE", deletedAt: null };
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
				{
					text: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		if (category) query.category = category;
		if (type) query.type = type;

		const count = await Blog.countDocuments(query);
		const result = await Blog.find(query)
			.populate({
				path: "category",
				match: { deletedAt: null },
			})
			.select("-__v")
			.sort({ createdAt: order })
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

async function getBlogByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Blog.findOne({ _id: id, deletedAt: null })
			.populate({
				path: "category",
			})
			.lean();

		if (!result)
			return reject(new NotFoundError(Errors.BLOG_NOT_FOUND.MESSAGE, Errors.BLOG_NOT_FOUND.CODE, { id }));

		return resolve(result);
	});
}
function getBlogsByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, title, category, searchQuery, type, status } = data;
		let query = {};
		let sort = {};

		//categories filters
		if (category) {
			query = { "category.title": new RegExp(category, "i") };
		}

		if (title) {
			query.title = new RegExp(title, "i");
		}

		if (type) {
			query.type = { $in: [...type] };
		}
		if (status) {
			query.status = { $in: [...status] };
		}

		//sort
		if (order == "DESC") {
			sort.createdAt = -1;
		} else if (order == "ASC") {
			sort.createdAt = +1;
		}

		if (searchQuery) {
			query["$or"] = [
				{
					"category.title": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					title: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const result = await Blog.aggregate([
			{
				$lookup: {
					from: "categories",
					localField: "category",
					foreignField: "_id",
					as: "category",
				},
			},
			{ $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
			{ $match: query },
			{
				$addFields: {
					categoryFieldType: {
						$cond: [
							{
								$ifNull: ["$category.title", false],
							},
							{ $type: "$category.title" },
							"null",
						],
					},
					categoryTitle: "$category.title",
				},
			},
			{ $sort: sort },
			{ $project: { categoryTitle: 0 } },
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

function blogSelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, title, searchQuery, category_title, type, description } = data;
		let query = { deletedAt: null };
		let sort = {};

		// //categories filters
		// if (category_title) {
		// 	query = { "category.title": new RegExp(category_title, "i") };
		// }

		// blog  filters
		if (description) {
			query.description = new RegExp(description, "i");
		}
		if (title) {
			query.title = new RegExp(title, "i");
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
					"category.title": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
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

		const result = await Blog.aggregate([
			{
				$lookup: {
					from: "categories",
					localField: "category",
					foreignField: "_id",
					as: "category",
				},
			},
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

function blogCategories(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, search } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {
			deletedAt: null,
			type: "CONTENT",
		};

		if (search) {
			query.$or = [
				{
					title: {
						$regex: search || "",
						$options: "i",
					},
				},
				{
					description: { $regex: search || "", $options: "i" },
				},
			];
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

module.exports = {
	addBlog,
	editBlog,
	deleteBlog,
	likeBlog,
	getBlog,
	getBlogs,
	blogSelector,
	getBlogByManager,
	getBlogsByManager,
	blogSelectorByManager,
	blogCategories,
	recommendedBlogs,
};

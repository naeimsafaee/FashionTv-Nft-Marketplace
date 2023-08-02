const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { Brands } = require("../../databases/mongodb");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

function addBrand(title, link, files) {
	return new Promise(async (resolve, reject) => {
		let data = { image: null };

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

		const result = await Brands.create({
			title,
			link,
			...data,
		});

		if (!result) return reject(new HumanError(Errors.BRAND_FAILED.MESSAGE, Errors.BRAND_FAILED.CODE));

		resolve("Successful");
	});
}

function editBrand(id, title, link, files) {
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

		if (title) update.title = title;
		if (link) update.link = link;

		const result = await Brands.findOneAndUpdate({ _id: id, deletedAt: null }, update);

		if (!result)
			return reject(new NotFoundError(Errors.BRAND_NOT_FOUND.MESSAGE, Errors.BRAND_NOT_FOUND.CODE, { id }));

		return resolve("Successful");
	});
}

function deleteBrand(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Brands.findOneAndUpdate({ _id: id, deletedAt: null }, { $set: { deletedAt: new Date() } });

		if (!result)
			return reject(new NotFoundError(Errors.BRAND_NOT_FOUND.MESSAGE, Errors.BRAND_NOT_FOUND.CODE, { id }));

		return resolve("Successful");
	});
}

function getBrand(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Brands.findOne({ _id: id, deletedAt: null }).lean();

		if (!result)
			return reject(new NotFoundError(Errors.BRAND_NOT_FOUND.MESSAGE, Errors.BRAND_NOT_FOUND.CODE, { id }));

		return resolve(result);
	});
}

function getBrands(data) {
	return new Promise(async (resolve, reject) => {
		let { page, limit, order, sort, search } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;

		const query = { deletedAt: null };

		if (search) {
			query.title = {
				$regex: search || "",
				$options: "i",
			};
		}

		const count = await Brands.countDocuments(query);
		const items = await Brands.find(query)
			.select("-__v")
			.sort({ createdAt: order })
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

function getBrandByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await Brands.findOne({ _id: id, deletedAt: null }).lean();

		if (!result)
			return reject(new NotFoundError(Errors.BRAND_NOT_FOUND.MESSAGE, Errors.BRAND_NOT_FOUND.CODE, { id }));

		return resolve(result);
	});
}

function getBrandsByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, title, createdAt, searchQuery } = data;

		let query = { deletedAt: null };
		let sort = {};

		if (title) {
			query.title = new RegExp(title, "i");
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
			];
		}

		const result = await Brands.aggregate([
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

module.exports = {
	addBrand,
	editBrand,
	deleteBrand,
	getBrand,
	getBrands,
	getBrandByManager,
	getBrandsByManager,
};

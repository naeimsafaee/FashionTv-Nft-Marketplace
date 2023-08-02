const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const mongoose = require("mongoose");
const { DiamondType, Diamond } = require("../../databases/mongodb");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

const addDiamondType = async (data, files) => {
	const { name, price } = data;

	let image = {};

	if (files && Object.keys(files).length) {
		if (files["image"]) {
			let file = files["image"].shift();

			image["image"] = [
				{
					name: file.newName,
					key: file.image,
					location: file.location,
				},
			];
		}
	}

	const result = await DiamondType.create({
		name,
		price,
		...image,
	});
	if (!result)
		throw new HumanError(Errors.Diamond_TYPE_CREATE_FAILED.MESSAGE, Errors.Diamond_TYPE_CREATE_FAILED.CODE);

	return result;
};

const editDiamondType = async (id, data, files) => {
	const { name, price } = data;
	let result = await DiamondType.findOne({ _id: id, deletedAt: null });
	if (!result)
		throw new NotFoundError(Errors.Diamond_TYPE_NOT_FOUND.MESSAGE, Errors.Diamond_TYPE_NOT_FOUND.CODE, { id });

	if (files && Object.keys(files).length) {
		if (files["image"]) {
			let file = files["image"].shift();

			result["image"] = [
				{
					name: file.newName,
					key: file.image,
					location: file.location,
				},
			];
		}
	}

	if (name) result.name = name;
	if (price) result.price = price;

	await result.save();

	return "Successful";
};

const deleteDiamondType = async (id) => {
	const result = await DiamondType.findOneAndUpdate(
		{ _id: id, deletedAt: null },
		{ $set: { deletedAt: new Date() } },
	);

	if (!result)
		throw new HumanError(Errors.Diamond_TYPE_DELETE_FAILED.MESSAGE, Errors.Diamond_TYPE_DELETE_FAILED.CODE, {
			id: id,
		});

	return result;
};

const getDiamondType = async (id) => {
	let result = await DiamondType.findOne({ _id: id, deletedAt: null }).lean();

	if (!result)
		throw new NotFoundError(Errors.Diamond_TYPE_NOT_FOUND.MESSAGE, Errors.Diamond_TYPE_NOT_FOUND.CODE, { id });

	return result;
};

const getDiamondTypes = async (data) => {
	return new Promise(async (resolve, reject) => {
		const { name, page, limit, order, sort, searchQuery, createdAt, id, price } = data;
		const query = { deletedAt: null };
		query.deletedAt = null;
		if (id) query._id = mongoose.Types.ObjectId(id);
		if (name) query.name = new RegExp(name, "i");
		if (price) query.price = new RegExp(price, "i");

		// if (createdAt) {
		// 	const { start, end } = dateQueryBuilder(createdAt);
		// 	query.createdAt = { $gte: start, $lte: end };
		// }

		//searchQuery
		if (searchQuery) {
			query["$or"] = [
				{
					name: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					price: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		let sortObject = { ["price"]: 1 };

		// if (sort === "price") {
		// 	sortObject = { ["price"]: order === "DESC" ? -1 : 1 };
		// }

		const result = await DiamondType.aggregate([
			{ $sort: sortObject },
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
};

const getDiamondTypeByManager = async (id) => {
	let result = await DiamondType.findOne({ _id: id, deletedAt: null }).lean();

	if (!result)
		throw new NotFoundError(Errors.Diamond_TYPE_NOT_FOUND.MESSAGE, Errors.Diamond_TYPE_NOT_FOUND.CODE, { id });

	return result;
};

const getDiamondTypesByManager = async (data) => {
	const { name, page, limit, order, price, sort, searchQuery, createdAt, id } = data;
	const query = {};
	// const ghostType = await diamondType.findOne({ where: { name: "Ghost" } });
	// if (!ghostType) throw new HumanError("ghostType does not exists");
	query.deletedAt = null;
	if (id) query._id = mongoose.Types.ObjectId(id);
	if (name) query.name = new RegExp(name, "i");

	if (createdAt) {
		const { start, end } = dateQueryBuilder(createdAt);
		query.createdAt = { $gte: start, $lte: end };
	}
	if (price) {
		query.price = { $eq: price };
	}

	if (searchQuery) {
		query.$or = [
			{
				name: { $regex: searchQuery || "", $options: "i" },
			},
		];
	}

	// if (searchQuery)
	//     query[postgres.Op.or] = [
	//         {
	//             id: postgres.sequelize.where(postgres.sequelize.cast(postgres.sequelize.col("id"), "varchar"), {
	//                 [postgres.Op.iLike]: `%${searchQuery}%`,
	//             }),
	//         },
	//         {name: {[postgres.Op.like]: "%" + searchQuery + "%"}},
	//     ];
	// let sortObject = { [sort]: order === "DESC" ? -1 : 1 };
	// 	if (sort === "price") {
	// 		sortObject = { ["diamondTypeId.price"]: order === "ASC" ? 1 : -1 };
	// 	}
	let sortObject = { [sort]: order === "DESC" ? -1 : 1 };
	if (sort === "price") {
		sortObject = { ["price"]: order === "DESC" ? -1 : 1 };
	}

	const count = await DiamondType.countDocuments(query);
	const items = await DiamondType.find(query)
		.select("-__v")
		.sort(sortObject)
		.skip((page - 1) * limit)
		.limit(limit)
		.lean();

	return {
		total: count ?? 0,
		pageSize: limit,
		page,
		data: items,
	};
};

module.exports = {
	addDiamondType,
	editDiamondType,
	deleteDiamondType,
	getDiamondType,
	getDiamondTypes,
	getDiamondTypeByManager,
	getDiamondTypesByManager,
};

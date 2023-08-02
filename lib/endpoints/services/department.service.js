const { NotAuthenticatedError, HumanError, NotFoundError } = require("../services/errorhandler/index");
const Errors = require("../services/errorhandler/MessageText");
// const {postgres, redis} = require("./../databases");
// const dataTypes = require("./../data/constans");
const { Manager, Department } = require("../../databases/mongodb");
const mongoose = require("mongoose");

async function addDepartment(name, description, headManagerId, managersId) {
	try {
		const _headManager = await Manager.findOne({ _id: headManagerId });
		if (!_headManager) throw new HumanError(Errors.MANAGER_NOT_FOUND.MESSAGE, Errors.MANAGER_NOT_FOUND.CODE);

		const existDepartment = await Department.findOne({ name: name });

		if (existDepartment) {
			throw new HumanError(Errors.DUPLICATE_DEPARTMENT.MESSAGE, Errors.DUPLICATE_DEPARTMENT.CODE, { name });
		}
		let arrayManagerId = [];
		if (managersId) {
			let output = managersId.map((managerId) => {
				let ids = mongoose.Types.ObjectId(managerId);
				return ids;
			});
			let query = {};
			query._id = { $in: [...output] };
			const findAllManagers = await Manager.find(query);
			arrayManagerId = findAllManagers.map((findAllManagerId) => {
				return findAllManagerId._id;
			});
		}

		const _department = await Department.create({
			name,
			...(description && { description: description }),
			headManagerId,
			managers: arrayManagerId,
		});

		return _department;
	} catch (e) {
		throw e;
	}
}

async function editDepartment(id, name, description, headManagerId, managersId) {
	// const existDepartment = await Department.findOne({
	// 	_id: id,
	// 	name: name,
	// });
	// if (existDepartment) {
	// 	throw new HumanError(Errors.DUPLICATE_DEPARTMENT.MESSAGE, Errors.DUPLICATE_DEPARTMENT.CODE, { name });
	// }

	let result;

	result = await Department.findOne({ _id: id, deletedAt: null });

	if (!result) {
		throw new NotFoundError(Errors.DEPARTMENT_NOT_FOUND.MESSAGE, Errors.DEPARTMENT_NOT_FOUND.CODE, { id });
	}
	if (name) result.name = name;
	if (description) result.description = description;
	if (headManagerId) result.headManagerId = headManagerId;
	if (result.managers) {
		result.managers = [];
	}
	let arrayManagerId = [];
	if (managersId) {
		arrayManagerId = managersId.map((managerId) => {
			return managerId;
		});
		result.managers = arrayManagerId;
	}

	await result.save();

	return result;
}

async function getDepartment(id) {
	let department = await Department.findOne({ _id: id, deletedAt: null })
		.populate([
			{ path: "headManagerId", model: "managers" },
			{ path: "managers", model: "managers" },
		])
		.lean();

	return department;
}

async function getDepartments(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, name, description, searchQuery, managerName, managerMobile, managerEmail } =
			data;
		let query = {};

		if (managerName) {
			query = { "headManager.name": new RegExp(managerName, "i") };
		}
		if (managerMobile) {
			query = { "headManager.mobile": new RegExp(managerMobile, "i") };
		}
		if (managerEmail) {
			query = { "headManager.email": new RegExp(managerEmail, "i") };
		}
		// if (priority) query.priority = new RegExp(priority, "i");

		// if (status) query.status = status;

		if (name) query.name = new RegExp(name, "i");
		if (description) query.description = new RegExp(description, "i");

		//searchQuery
		if (searchQuery) {
			query["$or"] = [
				{
					"headManager.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"headManager.mobile": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"headManager.email": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		let sortObject = { ["createdAt"]: -1 };

		if (sort == "createdAt") {
			sortObject = { ["createdAt"]: order === "DESC" ? -1 : 1 };
		}
		const result = await Department.aggregate([
			{
				$lookup: {
					from: "managers",
					localField: "headManagerId",
					foreignField: "_id",
					as: "headManager",
				},
			},
			{ $unwind: { path: "$headManager", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "managers",
					localField: "managers",
					foreignField: "_id",
					as: "managers",
				},
			},
			{ $match: { $and: [query, { deletedAt: null }] } },
			//{ $sort: { $or: [sortObject , {"createdAt" : 1 }] } }
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
// let offset = (page - 1) * limit;

// let where = {};

// if (searchQuery) {
//     where = {
//         [Op.or]: [
//             {name: {[Op.like]: "%" + searchQuery + "%"}},
//             {"$headManager.name$": {[Op.like]: "%" + searchQuery + "%"}},
//             {"$headManager.mobile$": {[Op.like]: "%" + searchQuery + "%"}},
//             {"$headManager.email$": {[Op.like]: "%" + searchQuery + "%"}},
//         ],
//     };
// }

// const _departments = await Department.findAll({
//     where,
//     limit,
//     offset,
//     include: [
//         {
//             model: Manager,
//             as: "headManager",
//         },
//     ],
//     order: [["createdAt", order]],
// });
// const departments = await Department.findAndCountAll({
//     where,
//     limit,
//     offset,
//     nest: true,
//     include: [
//         {
//             model: Manager,
//             as: "headManager",
//         },
//     ],
//     order: [["createdAt", order]],
//     raw: true,
// });
// for (let i = 0; i < _departments.length; i++) {
//     departments.rows[i].headManager = _departments[i].headManager;
//     departments.rows[i].managers = await _departments[i].getManagers();
// }

// return {
//     total: departments.count,
//     pageSize: limit,
//     page,
//     data: departments.rows,
// };

///////////////////////////////////////////////////////////////////

async function deleteDepartment(id) {
	//const result = await Department.destroy({ where: { id } });
	const result = await Department.findOneAndUpdate({ _id: id }, { $set: { deletedAt: new Date() } });
	if (!result) throw new NotFoundError(Errors.DEPARTMENT_NOT_FOUND.MESSAGE, Errors.DEPARTMENT_NOT_FOUND.CODE, { id });
	return "Successful";
}

async function departmentSelector(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, searchQuery, sort, name, description } = data;
		let query = {};

		if (name) query.name = new RegExp(name, "i");
		if (description) query.description = new RegExp(description, "i");
		// if (headManagerٍEmail) {
		// 	query = { "departmentId._id": mongoose.Types.ObjectId(departmentId) };

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
					description: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		let sortObject = { ["createdAt"]: -1 };

		if (sort == "createdAt") {
			sortObject = { ["createdAt"]: order === "DESC" ? -1 : 1 };
		}
		const result = await Department.aggregate([
			{
				$lookup: {
					from: "managers",
					localField: "headManagerId",
					foreignField: "_id",
					as: "headManager",
				},
			},
			{ $unwind: { path: "$headManager", preserveNullAndEmptyArrays: true } },
			{ $match: { $and: [query, { deletedAt: null }] } },
			//{ $sort: { $or: [sortObject , {"createdAt" : 1 }] } }
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

module.exports = {
	addDepartment,
	editDepartment,
	getDepartments,
	getDepartment,
	deleteDepartment,
	departmentSelector,
};

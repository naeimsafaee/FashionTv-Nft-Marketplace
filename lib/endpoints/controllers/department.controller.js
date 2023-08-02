const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { departmentService } = require("./../services");
// const { categoryService } = require("./../../services");

/**
 * Get department
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.addDepartment = async (req, res) => {
	try {
		const { name, description, headManagerId, managersId } = req.body;
		const data = await departmentService.addDepartment(name, description, headManagerId, managersId);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		if (!e.statusCode) e = { statusCode: 500, status: "Internal Error", message: e.message };
		return res.status(e.statusCode).json(e);
	}
};
/////////////////////////////////////////////////////////////////
/**
 * edit department
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.editDepartment = async (req, res) => {
	const { id, name, description, headManagerId, managersId /*,addedManagersId, removedManagersId*/ } = req.body;
	const data = await departmentService.editDepartment(
		id,
		name,
		description,
		headManagerId,
		managersId,
		// addedManagersId,
		// removedManagersId,
	);
	return response({ res, statusCode: httpStatus.ACCEPTED, data });
};

/**
 * Get a department
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getDepartment = async (req, res) => {
	const { id } = req.params;
	const data = await departmentService.getDepartment(id);
	return response({ res, statusCode: httpStatus.OK, data });
};

/**
 * Get all departments
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getDepartments = async (req, res) => {
	const data = await departmentService.getDepartments(req.query);
	return response({ res, statusCode: httpStatus.OK, data });
};

/**
 * delete department
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.deleteDepartment = async (req, res) => {
	const { id } = req.params;
	const data = await departmentService.deleteDepartment(id);
	return response({ res, statusCode: httpStatus.ACCEPTED, data });
};

/**
 * Department Selector
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.departmentSelector = async (req, res) => {
	const data = await departmentService.departmentSelector(req.query);
	return response({ res, statusCode: httpStatus.OK, data });
};

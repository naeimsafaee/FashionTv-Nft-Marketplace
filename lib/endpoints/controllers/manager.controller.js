const {httpResponse: { response }, httpStatus,} = require("./../../utils");
const {managerService, requestService, categoryService,} = require("./../services");


/**
 * get manager list
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getManagers = async (req, res) => {
	try {
		const data = await managerService.getManagers(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};


// Role
/**
 * create Role
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.createRole = async (req, res) => {
	try {
		const { name, nickName, permissions } = req.body;

		const data = await managerService.createRole(name, nickName, permissions);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get Roles
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.getRoles = async (req, res) => {
	try {
		const data = await managerService.getRoles(req.query);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.findRoleById = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await managerService.findRoleById(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * delete Role
 * @param {*} req
 * @param {*} res
 */
exports.deleteRole = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await managerService.deleteRole(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * update Role
 * @param {*} req
 * @param {*} res
 */
exports.updateRole = async (req, res) => {
	try {
		const data = await managerService.updateRole(req.body);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

// Manager
/**
 * Get Managers
 * @param {*} req
 * @param {*} res
 */
exports.getManagers = async (req, res) => {
	try {
		const data = await managerService.getManagers(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * Add Managers
 * @param {*} req
 * @param {*} res
 */
exports.addManagers = async (req, res) => {
	try {
		const data = await managerService.addManagers(req.body, req.files);
		return response({ res, statusCode: httpStatus.CREATED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * edit Managers
 * @param {*} req
 * @param {*} res
 */
exports.editManagers = async (req, res) => {
	try {
		const data = await managerService.editManagers(req.body, req.files);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * delete Managers
 * @param {*} req
 * @param {*} res
 */
exports.deleteManagers = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await managerService.deleteManagers(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * find Managers by id
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.findManagerById = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await managerService.findManagerById(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

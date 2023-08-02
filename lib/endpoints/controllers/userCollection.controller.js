const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("./../../utils");
const { userService } = require("../services");
const { userCollectionService } = require("../services");

exports.addUserCollection = async (req, res) => {
	try {
		const { name, description, category, links, explicitContent } = req.body;
		const data = await userCollectionService.addUserCollection(
			name,
			description,
			category,
			links,
			explicitContent,
			req.files,
			req.userEntity,
			req.fileValidationError,
		);

		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserCollections = async (req, res) => {
	try {
		const data = await userCollectionService.getUserCollections(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserCollection = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await userCollectionService.getUserCollection(id, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.editUserCollection = async (req, res) => {
	try {
		const { id, name, description, category, links, explicitContent } = req.body;
		const data = await userCollectionService.editUserCollection(
			id,
			name,
			description,
			category,
			links,
			explicitContent,
			req.files,
			req.userEntity,
			req.fileValidationError,
		);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.deleteUserCollection = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await userCollectionService.deleteUserCollection(id, req.userEntity);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.userCollectionSelector = async (req, res) => {
	try {
		const { page, limit, order, sort, searchQuery } = req.query;
		const data = await userCollectionService.userCollectionSelector(page, limit, order, sort, searchQuery);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserCollectionsByManager = async (req, res) => {
	try {
		const data = await userCollectionService.getUserCollectionsByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserCollectionByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await userCollectionService.getUserCollectionByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.userCollectionSelectorByManager = async (req, res) => {
	try {
		const data = await userCollectionService.userCollectionSelector(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.customCollection = async (req, res) => {
	try {
		const { page, limit, order, sort, searchQuery } = req.query;
		const data = await userCollectionService.customCollection(page, limit, order, sort, searchQuery);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.editUserCollectionByManager = async (req, res) => {
	try {
		const { id, isFeatured, isVerified, isExplorer } = req.body;
		const data = await userCollectionService.editUserCollectionByManager(id, isFeatured, isVerified, isExplorer);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

/**
 * get token or colection user activity
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.userActivity = async (req, res) => {
	try {
		const data = await userCollectionService.userActivity(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};


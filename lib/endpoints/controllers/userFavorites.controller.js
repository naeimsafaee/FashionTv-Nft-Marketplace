const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { userFavoritesService } = require("../services");

exports.getOneUserFavoritesByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await userFavoritesService.getOneUserFavoritesByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getAllUserFavoritesByManager = async (req, res) => {
	try {
		const data = await userFavoritesService.getAllUserFavoritesByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.userFavoritesSelectorByManager = async (req, res) => {
	try {
		const data = await userFavoritesService.userFavoritesSelectorByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

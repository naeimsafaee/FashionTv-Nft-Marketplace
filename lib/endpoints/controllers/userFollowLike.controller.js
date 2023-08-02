const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { userFollowLikeService } = require("../services");

exports.followUser = async (req, res) => {
	try {
		const { address } = req.body;

		const data = await userFollowLikeService.followUser(address, req.userEntity.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.unFollowUser = async (req, res) => {
	try {
		const { address } = req.body;
		const data = await userFollowLikeService.unFollowUser(address, req.userEntity.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.likeToken = async (req, res) => {
	try {
		const { tokenId } = req.body;
		const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

		const data = await userFollowLikeService.likeToken(tokenId, req.userEntity?.id , ip);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.unLikeToken = async (req, res) => {
	try {
		const { tokenId } = req.body;
		const data = await userFollowLikeService.unLikeToken(tokenId, req.userEntity.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.likeCollection = async (req, res) => {
	try {
		const { collectionId } = req.body;

		const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

		const data = await userFollowLikeService.likeCollection(collectionId, req.userEntity?.id , ip);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.unLikeCollection = async (req, res) => {
	try {
		const { collectionId } = req.body;
		const data = await userFollowLikeService.unLikeCollection(collectionId, req.userEntity.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserFollowers = async (req, res) => {
	try {
		const { page, limit, address } = req.query;

		const data = await userFollowLikeService.getUserFollowers(page, limit, address);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.getUserFollowing = async (req, res) => {
	try {
		const { page, limit, address } = req.query;

		const data = await userFollowLikeService.getUserFollowing(page, limit, address);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getUserFavoriteToken = async (req, res) => {
	try {
		const { page, limit } = req.query;

		const data = await userFollowLikeService.getUserFavoriteToken(page, limit , req.userEntity.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};
exports.getUserFavoriteCollection = async (req, res) => {
	try {
		const { page, limit } = req.query;

		const data = await userFollowLikeService.getUserFavoriteCollection(page, limit , req.userEntity.id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

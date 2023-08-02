const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { userFavorites } = require("../../databases/mongodb");

async function getOneUserFavoritesByManager(id) {
	return new Promise(async (resolve, reject) => {
		const result = await userFavorites
			.findById(id)
			.populate("user", "-__v")
			.populate("collectionId", "-__v")
			.populate("tokenId", "-__v")
			.lean();

		if (!result)
			return reject(
				new NotFoundError(
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.MESSAGE,
					Errors.USER_ASSIGNED_TOKEN_NOT_FOUND.CODE,
					{ id },
				),
			);

		return resolve(result);
	});
}

function getAllUserFavoritesByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, user, followers, following } = data;

		const query = {};
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		if (user) query.user = user;
		if (followers) query.followers = followers;
		if (following) query.following = following;

		const count = await userFavorites.countDocuments();
		const items = await userFavorites
			.find(query)
			.populate("user", "-__v")
			.populate("followers", "-__v")
			.populate("following", "-__v")
			.select("-__v")
			.sort(sortObj)
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

function userFavoritesSelectorByManager(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, searchQuery } = data;
		const sortObj = {};
		sortObj[sort || "createdAt"] = order;
		const query = {};

		if (searchQuery) {
			query["$or"] = [
				{
					"user.username": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					// "followers.$.name":
					"followers.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					// "following.$.name":
					"following.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const count = await userFavorites.countDocuments(query);
		const result = await userFavorites
			.find(query)
			.populate("user", "-__v")
			.populate("followers", "-__v")
			.populate("following", "-__v")
			.select("-__v")
			.sort(sortObj)
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: result,
		});
	});
}

module.exports = {
	getOneUserFavoritesByManager,
	getAllUserFavoritesByManager,
	userFavoritesSelectorByManager,
};

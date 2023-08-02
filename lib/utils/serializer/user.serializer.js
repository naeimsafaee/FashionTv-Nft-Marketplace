const mongoose = require("mongoose");
const { UserWallet, Category, UserCollection, Role, User, UserFollowLike, UserDiamond} = require("../../databases/mongodb");
const { assignGhostCard } = require("../../endpoints/services/auth.service");

exports.serializeUser = async (user, client = null) => {
	if (!user) return;

	if (user.toObject) user = user.toObject();
	let followersCount = await mongoose.model("userFollowLike").countFollowers(user._id);
	let followingCount = await mongoose.model("userFollowLike").countFollowing(user._id);
	let following = await mongoose.model("userFollowLike").isFollowing(client && client._id, user._id);
	let collectionsCount = await mongoose.model("userCollections").countDocuments({ user: user._id, deletedAt: null });

	// NFTS Count (it must be count of Tokens not Assiged Token)
	let assignedTokens = await mongoose
		.model("userAssignedTokens")
		.find({ userId: user._id, status: { $in: ["FREE", "IN_AUCTION"] }, deletedAt: null })
		.lean();

	const tokenIds = assignedTokens.map((at) => String(at.tokenId));
	const filtered = assignedTokens.filter(({ tokenId }, index) => !tokenIds.includes(String(tokenId), index + 1));

	const diamondsCount = await UserDiamond.countDocuments({
		userId: user._id,
		deletedAt: null,
	});

	let GhostMode = await assignGhostCard(user);

	return {
		...user,
		following,
		followersCount,
		followingCount,
		collectionsCount,
		nftsCount: filtered.length,
		diamondsCount:diamondsCount,
		GhostMode: GhostMode,
	};
};

exports.serializeManger = async (user, client = null) => {
	if (!user) return;

	if (user.toObject) user = user.toObject();

	user = await User.findOne({ _id: user._id }).populate({ path: "roleId", populate: { path: "permissions" } });

	// const role = await Role.findOne({_id: user.roleId});
	// const permissions = await PermissionRole.find({roleId: user.roleId}).select("")
	//
	// const rolePermissions =
	//     {
	//         'role': role.name,
	//         permissions: role.permissions.map((permission) => permission.name)
	//     };
	//
	// const userPermissions = result2.permissions.map((permission) => {
	//     return {name: permission.name};
	// });

	return {
		...user,
		// rolePermissions,
		// userPermissions,
		// roles
	};
};

exports.serializeUsers = async (users = [], client) => {
	if (!users instanceof Array) throw Error("Unknown type");
	return Promise.all(users.map((user) => this.serializeUser(user, client)));
};

exports.serializeLikes = async (likes = [], client) => {
	if (!likes instanceof Array) throw Error("Unknown type");
	return Promise.all(likes.map((token) => this.serializeUser(token, client)));
};
exports.serializeCollections = async (collection = [], client) => {
	if (!collection instanceof Array) throw Error("Unknown type");
	return Promise.all(collection.map((collection) => this.serializeUser(collection, client)));
};

exports.getUserWallet = async (user) => {
	const wallets = await UserWallet.find({ userId: user._id, deletedAt: null }).populate("assetId");

	return wallets;
};

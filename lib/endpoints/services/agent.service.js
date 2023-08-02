const { User, AgentSession, Fee, UserWallet, AgentStatistic, AgentReward } = require("../../databases/mongodb");
const phone = require("phone");
const { NotFoundError, HumanError } = require("./errorhandler");
const { password, jwt } = require("../../utils");
const Errors = require("./errorhandler/MessageText");
const mongoose = require("mongoose");

/**
 * login manager
 */
async function login(mobile, email, _password) {
	const findObject = { level: "AGENT" };

	email = email.toLowerCase();
	findObject.email = email;

	const user = await User.findOne({ email: email, level: "AGENT" });
	if (!user) throw new NotFoundError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE, findObject);
	console.log({ user });
	const checkPassword = await password.validate(_password, user.salt, user.password);
	console.log("checkPassword = ", checkPassword);

	if (!checkPassword && findObject.email)
		throw new HumanError(Errors.EMAIL_AND_PASSWORD_INCORRECT.MESSAGE, Errors.EMAIL_AND_PASSWORD_INCORRECT.CODE);

	// generate user auth token
	const _token = new jwt.Token(user._id, "agent");

	const refreshToken = _token.generateRefresh();

	const accessToken = _token.generateAccess();

	await AgentSession.create({
		userId: user._id,
		accessToken,
		refreshToken,
		accessExpiresAt: _token.accessExpiresAt,
		refreshExpiresAt: _token.refreshExpiresAt,
	});

	return {
		refreshToken: {
			token: refreshToken,
			expiresAt: _token.refreshExpiresAt,
		},
		accessToken: {
			token: accessToken,
			expiresAt: _token.accessExpiresAt,
		},
	};
}

/**
 * logout agent and delete current active session
 * @param {*} session
 * @returns
 */
async function logout(session) {
	let res = await AgentSession.deleteOne({ _id: session._id });

	if (res) return true;

	return false;
}

/**
 * get agent info
 * @param {*} id
 * @returns
 */
async function info(id) {
	const agent = await User.findOne({ _id: id, level: "AGENT" }).select(
		"id address name mobile email referralCode avatar levelId createdAt",
	);

	const fee = await Fee.findOne({
		userType: "AGENT",
		userLevel: agent.levelId,
	}).populate({ path: "assetId" });

	agent["fee"] = null;
	if (fee) agent.fee = fee;

	return agent;
}

/**
 * get agent wallet
 * @param {*} userId
 * @returns
 */
async function wallet(userId) {
	let result = await UserWallet.find({
		userId,
	}).populate({ path: "assetId" });

	return result;
}

/**
 * get agent statistics
 */
async function statistics(agentId, page, limit) {
	let count = await AgentStatistic.countDocuments({ agentId });
	let result = await AgentStatistic.find({ agentId })
		.populate({ path: "userId", select: "name avatar createdAt" })
		.select("-__v")
		.sort({ createdAt: "DESC" })
		.skip((page - 1) * limit)
		.limit(limit)
		.lean();

	return {
		total: count,
		pageSize: limit,
		page,
		data: result,
	};
}

/**
 * get agent statistics details
 */
async function statisticDetails(agentId, userId, page, limit) {
	let query = { agentId: mongoose.Types.ObjectId(agentId) };

	if (userId) {
		query = { ...query, "userId._id": mongoose.Types.ObjectId(userId) };
	}

	const result = await AgentReward.aggregate([
		{
			$lookup: {
				from: "users",
				let: { userId: "$_id" },
				pipeline: [{ $project: { name: 1, createdAt: 1, avatar: 1 } }],
				as: "userId",
			},
		},
		{ $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
		{ $sort: { createdAt: 1 } },
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

	return {
		total: metadata?.total ?? 0,
		pageSize: limit,
		page: metadata?.page ?? page,
		data: items,
	};
}

module.exports = {
	login,
	logout,
	info,
	wallet,
	statistics,
	statisticDetails,
};

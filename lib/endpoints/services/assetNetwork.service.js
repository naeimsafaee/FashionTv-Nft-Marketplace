const { AssetNetwork, Network } = require("../../databases/mongodb");

const { NotFoundError, HumanError, InvalidRequestError, ConflictError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");

/**
 * Get all assetNetwork from user and manager
 */
function get(data) {
	return new Promise(async (resolve, reject) => {
		let {
			id,
			page,
			limit,
			order,
			assetId,
			networkId,
			withdrawFee,
			depositFee,
			canDeposit,
			canWithdraw,
			feeType,
			network,
			asset,
			isActive,
			fee,
			gasPrice,
			sort,
			gasLimit,
			minConfirm,
			unlockConfirm,
			withdrawMin,
			depositMin,
			apiCode,
			createdAt,
			searchQuery,
		} = data;

		let query = {};

		if (id) query.id = id;
		if (isActive) query.isActive = isActive;
		if (fee) query.fee = fee;
		if (gasPrice) query.gasPrice = gasPrice;
		if (gasLimit) query.gasLimit = gasLimit;
		if (minConfirm) query.minConfirm = minConfirm;
		if (unlockConfirm) query.unlockConfirm = unlockConfirm;
		if (withdrawMin) query.withdrawMin = withdrawMin;
		if (depositMin) query.depositMin = depositMin;
		if (apiCode) query.apiCode = apiCode;
		if (createdAt) query.createdAt = createdAt;

		if (feeType) query.feeType = feeType;

		if (searchQuery) {
			query.$or = [
				{
					gasPrice: searchQuery,
				},
				{
					gasLimit: searchQuery,
				},
				{
					minConfirm: searchQuery,
				},
				{
					unlockConfirm: searchQuery,
				},
			];
		}

		const count = await AssetNetwork.countDocuments(query);

		let result = await AssetNetwork.find(query)
			.populate([
				{
					path: "assetId",
					model: "assets",
				},
				{
					path: "networkId",
					model: "networks",
				},
			])
			.select("-__v")
			.sort({ amount: "DESC" })
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

/**
 * Get all assetNetwork Selector from user and manager
 */
// function assetNetworkSelector(data) {
//     return new Promise(async (resolve, reject) => {
//         let {page, limit, order, searchQuery} = data;
//         let queryAsset = {};
//         let queryNetwork = {};
//         if (searchQuery) {
//             queryAsset = {
//                 [postgres.Op.or]: {
//                     name: {[postgres.Op.iLike]: "%" + searchQuery + "%"},
//                 },
//             };
//             queryNetwork = {
//                 [postgres.Op.or]: {
//                     name: {[postgres.Op.iLike]: "%" + searchQuery + "%"},
//                 },
//             };
//         } else {
//             queryAsset = {};
//             queryNetwork = {};
//         }
//         let result = {},
//             offset = (page - 1) * limit;
//
//         result = await postgres.AssetNetwork.findAndCountAll({
//             limit,
//             offset,
//             order: [["createdAt", order]],
//             raw: true,
//             nest: true,
//             include: [
//                 {model: postgres.Asset, as: "asset", where: queryAsset},
//                 {model: postgres.Network, as: "network", where: queryNetwork},
//             ],
//         });
//
//         resolve({
//             total: result.count ?? 0,
//             pageSize: limit,
//             page,
//             data: result.rows,
//         });
//     });
// }

/**
 * Set asset network
 */

function set(data) {
	return new Promise(async (resolve, reject) => {
		let result = await AssetNetwork.create(data);

		if (!result) return reject(new HumanError("failed to create AssetNetwork", 400));

		return resolve("Successful");
	});
}

/**
 * Edit asset network to the user and manager
 */
function edit(data) {
	return new Promise(async (resolve, reject) => {
		let {
			id,
			assetId,
			networkId,
			withdrawFee,
			depositFee,
			canDeposit,
			canWithdraw,
			feeType,
			isActive,
			fee,
			gasPrice,
			gasLimit,
			minConfirm,
			unlockConfirm,
			withdrawMin,
			depositMin,
			apiCode,
			withdrawDescription,
			depositDescription,
			specialTips,
		} = data;
		let result = await AssetNetwork.findOne({ _id: id });

		if (assetId) result.assetId = assetId;
		if (networkId) result.networkId = networkId;
		if (isActive) result.isActive = isActive;
		if (withdrawFee) result.withdrawFee = withdrawFee;
		if (depositFee) result.depositFee = depositFee;
		if (fee) result.fee = fee;
		if (gasPrice) result.gasPrice = gasPrice;
		if (gasLimit) result.gasLimit = gasLimit;
		if (minConfirm) result.minConfirm = minConfirm;
		if (unlockConfirm) result.unlockConfirm = unlockConfirm;
		if (canDeposit) result.canDeposit = canDeposit;
		if (canWithdraw) result.canWithdraw = canWithdraw;
		if (withdrawMin) result.withdrawMin = withdrawMin;
		if (depositMin) result.depositMin = depositMin;
		if (withdrawDescription) result.withdrawDescription = withdrawDescription;
		if (depositDescription) result.depositDescription = depositDescription;
		if (specialTips) result.specialTips = specialTips;
		if (feeType) result.feeType = feeType;
		if (apiCode) result.apiCode = apiCode;

		await result.save();

		if (!result) return reject(new NotFoundError("assetNetwork not found", 400, { id: data.id }));

		return resolve("Successful");
	});
}

/**
 * Delete public and private assetNetworks to the user and manager
 */
function del(id) {
	return new Promise(async (resolve, reject) => {
		let result = await AssetNetwork.findOneAndUpdate({ _id: id }, { $set: { deletedAt: new Date() } });

		if (!result)
			return reject(
				new NotFoundError(Errors.ASSET_NETWORK_NOT_FOUND.MESSAGE, Errors.ASSET_NETWORK_NOT_FOUND.CODE, { id }),
			);

		return resolve("Successful");
	});
}

/**
 *
 */
function findById(id) {
	return new Promise(async (resolve, reject) => {
		let result = await AssetNetwork.findById({
			_id: id,
			deletedAt: null,
		})
			.populate({ path: "assetId" })
			.populate({ path: "networkId" });

		if (!result)
			return reject(
				new NotFoundError(Errors.ASSET_NETWORK_NOT_FOUND.MESSAGE, Errors.ASSET_NETWORK_NOT_FOUND.CODE, { id }),
			);

		return resolve(result);
	});
}

function getNetwork(data) {
	return new Promise(async (resolve, reject) => {
		const { limit, page, name, type, searchQuery } = data;
		let query = {};
		query.deletedAt = null;

		if (name) {
			query.name = new RegExp(name, "i");
		}

		if (type) {
			query.type = { $in: [...type] };
		}

		if (searchQuery) {
			query.$or = [
				{
					name: { $regex: searchQuery || "", $options: "i" },
				},
				{
					type: { $regex: searchQuery || "", $options: "i" },
				},
			];
		}

		const count = await Network.countDocuments(query);

		let result = await Network.find(query)
			.select("-__v")
			.sort({ createdAt: "DESC" })
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
	set,
	get,
	edit,
	del,
	findById,
	getNetwork,
};

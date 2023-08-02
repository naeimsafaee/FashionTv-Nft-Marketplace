const { NotFoundError, HumanError, ConflictError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { Setting } = require("../../databases/mongodb");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

function addSetting(data) {
	return new Promise(async (resolve, reject) => {
		const { key, value } = data;
		const existSetting = await Setting.findOne({ key });
		if (existSetting) {
			return reject(
				new ConflictError(Errors.SETTING_ALREADY_EXIST.MESSAGE, Errors.SETTING_ALREADY_EXIST.CODE, { key }),
			);
		}

		const setting = await Setting.create({ key, value });

		return resolve(setting);
	});
}

function editSetting(data) {
	return new Promise(async (resolve, reject) => {
		const { key, value } = data;
		const existSetting = await Setting.findOne({ key });
		if (!existSetting) {
			return reject(new ConflictError(Errors.SETTING_NOT_FOUND.MESSAGE, Errors.SETTING_NOT_FOUND.CODE, { key }));
		}

		existSetting.value = value;
		await existSetting.save();
		return resolve(existSetting);
	});
}

/**
 * get fee by type and chain
 * @param {*} type
 * @param {*} chain
 * @returns
 */
function getSetting(type, chain) {
	return new Promise(async (resolve, reject) => {
		const thisSettingFee = await Setting.findOne({
			key: type + "_FEE_" + chain,
			deletedAt: null,
		}).lean();
		const thisSettingAddress = await Setting.findOne({
			key: type + "_ADDRESS_" + chain,
			deletedAt: null,
		}).lean();

		return resolve({
			fee: thisSettingFee ? thisSettingFee.value : null,
			address: thisSettingAddress ? thisSettingAddress.value : null,
		});
	});
}
function getSettings(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, key, value, type, createdAt, searchQuery } = data;

		const query = { deletedAt: null };
		const sort = {};

		// setting filters
		if (key) {
			query.key = new RegExp(key, "i");
		}
		if (type) {
			query.type = { $in: [...type] };
		}

		if (value) {
			query.value = new RegExp(value, "i");
		}

		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		//sort
		if (order == "DESC") {
			sort.createdAt = -1;
		} else if (order == "ASC") {
			sort.createdAt = +1;
		}

		//searchQuery
		if (searchQuery) {
			query["$or"] = [
				{
					value: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					type: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const result = await Setting.aggregate([
			{ $sort: sort },
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

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});
	});
}

module.exports = {
	addSetting,
	editSetting,
	getSetting,
	getSettings,
};

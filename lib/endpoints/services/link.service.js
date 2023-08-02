const { User, AgentLink, AgentReward, AgentLinkStatistic } = require("../../databases/mongodb");
const {
	dateQueryBuilder,
	extractStartAndEndOfDay,
	startDateQueryBuilder,
	endDateQueryBuilder,
} = require("../../utils/dateQueryBuilder");
const { HumanError, InternalError, NotFoundError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const em = require("exact-math");
const mongoose = require("mongoose");

exports.createLink = (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { name } = data;

		const existLink = await AgentLink.findOne({ name: name, agentId: user._id });
		if (existLink) {
			return reject(new HumanError(Errors.DUPLICATE_LINK.MESSAGE, Errors.DUPLICATE_LINK.CODE, { name }));
		}

		const code = Math.floor(100000 + Math.random() * 900000);

		const base = process.env.NODE_ENV === "development" ? "api.ftvnft.com" : "api.ftvio.com";
		const url = `https://${base}/api/user/links/go/${code}`;

		const newLink = await AgentLink.create({ name, code, url, agentId: user._id });
		if (!newLink) {
			return reject(new InternalError(Errors.ADD_FAILED.MESSAGE, Errors.ADD_FAILED.CODE));
		}

		return resolve("Success");
	});
};

exports.editLink = (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { id, name } = data;

		const currentLink = await AgentLink.findOne({ _id: id, agentId: user._id });
		if (!currentLink) {
			return reject(new NotFoundError(Errors.LINK_NOT_FOUND.MESSAGE, Errors.LINK_NOT_FOUND.CODE, { id }));
		}

		const existLink = await AgentLink.findOne({
			name: name ? name : "null",
			agentId: user._id,
			_id: { $ne: id },
		});

		if (existLink) {
			return reject(new HumanError(Errors.DUPLICATE_LINK.MESSAGE, Errors.DUPLICATE_LINK.CODE, { name }));
		}

		const updateData = {};

		if (name) updateData.name = name;

		const updatedLink = await currentLink.update(updateData);

		if (!updatedLink) {
			return reject(new InternalError(Errors.LINK_UPDATE_FAILED.MESSAGE, Errors.LINK_UPDATE_FAILED.CODE));
		}

		return resolve("Success");
	});
};

exports.deleteLink = (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { id } = data;

		const currentLink = await AgentLink.findOne({ _id: id, agentId: user._id });
		if (!currentLink) {
			return reject(new NotFoundError(Errors.LINK_NOT_FOUND.MESSAGE, Errors.LINK_NOT_FOUND.CODE, { id }));
		}

		const deletedLink = await currentLink.deleteOne();

		return resolve(deletedLink);
	});
};

exports.getLink = (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { id } = data;
		const query = {
			deletedAt: null,
			agentId: user._id,
		};

		if (id) query._id = mongoose.Types.ObjectId(id);

		const currentLink = await AgentLink.findOne(query);
		if (!currentLink) {
			return reject(new NotFoundError(Errors.LINK_NOT_FOUND.MESSAGE, Errors.LINK_NOT_FOUND.CODE, { id }));
		}

		return resolve(currentLink);
	});
};

exports.getLinks = (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { page, limit, sort, order, createdAt, id, searchQuery, name } = data;

		const query = {
			deletedAt: null,
			"agentId._id": user._id,
		};
		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}
		if (id) query._id = mongoose.Types.ObjectId(id);
		// if (diamondTypeId) query.diamondTypeId = {$in: diamondTypeId};
		if (name) query.name = new RegExp(name, "i");

		if (searchQuery) {
			query.$or = [
				{
					name: { $regex: searchQuery || "", $options: "i" },
				},
			];
		}

		let sortObject = { [createdAt]: order === "DESC" ? -1 : 1 };

		const result = await AgentLink.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "agentId",
					foreignField: "_id",
					as: "agentId",
				},
			},
			{ $unwind: { path: "$agentId", preserveNullAndEmptyArrays: true } },
			{ $sort: sortObject },
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
};

exports.getLinkByManager = (data) => {
	return new Promise(async (resolve, reject) => {
		const { id } = data;

		const currentLink = await AgentLink.findOne({ _id: id });
		if (!currentLink) {
			return reject(new NotFoundError(Errors.LINK_NOT_FOUND.MESSAGE, Errors.LINK_NOT_FOUND.CODE, { id }));
		}

		return resolve(currentLink);
	});
};

exports.getLinksByManager = (data) => {
	return new Promise(async (resolve, reject) => {
		const { page, limit, sort, order, createdAt, id, searchQuery, name } = data;

		const query = { deletedAt: null };
		const offset = (page - 1) * limit;

		// if (createdAt) {
		//     const {start, end} = dateQueryBuilder(createdAt);
		//     query.createdAt = {[Op.gte]: start, [Op.lte]: end};
		// }
		//
		// if (searchQuery) {
		//     query[Op.or] = [
		//         {
		//             id: sequelize.where(sequelize.cast(sequelize.col("id"), "varchar"), {
		//                 [Op.iLike]: `%${searchQuery}%`,
		//             }),
		//         },
		//         {name: {[Op.iLike]: `%${searchQuery}%`}},
		//     ];
		// }
		//
		// if (id)
		//     query.id = sequelize.where(sequelize.cast(sequelize.col("id"), "varchar"), {
		//         [Op.iLike]: `%${id}%`,
		//     });
		// if (name) query.name = {[Op.iLike]: `%${name}%`};

		const count = await AgentLink.countDocuments({ where: query });
		const items = await AgentLink.find({
			where: query,
		})
			.select("-__v")
			.sort({ createdAt: "DESC" })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count,
			pageSize: limit,
			page,
			data: items,
		});
		return resolve(items);
	});
};

exports.getLinkStatistics = (id, data, user) => {
	return new Promise(async (resolve, reject) => {
		const { page, limit, sort, order, searchQuery } = data;

		const query = {
			_id: mongoose.Types.ObjectId(id),
			"agentLinkId.agentId": user._id,
		};

		if (searchQuery) {
			query["$or"] = [
				{
					"agentLinkId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"userId.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}

		const result = await AgentLinkStatistic.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userId",
				},
			},
			{ $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "agentLinks",
					localField: "agentLinkId",
					foreignField: "_id",
					as: "agentLinkId",
				},
			},
			{ $unwind: { path: "$agentLinkId", preserveNullAndEmptyArrays: true } },
			//{ $sort: sortObject },
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
};

exports.getCommissionsChart = (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { start, end } = data;
		const query = {
			agentId: user._id,
			createdAt: { $gte: start, $lte: end },
		};

		// let {startAt, endAt} = extractStartAndEndOfDay(start, end);

		let startDate = startDateQueryBuilder(start);
		let endDate = endDateQueryBuilder(end);

		query.createdAt = { $gte: startDate, $lte: endDate };

		// const count = await AgentReward.find({where: query});
		const items = await AgentReward.find({
			where: query,
			attributes: ["createdAt", "commission"],
			raw: true,
		});

		const filtered = [];
		if (items.length > 0) {
			items.forEach((p) => {
				const foundedPriceIndex = filtered.findIndex(
					(f) =>
						f.createdAt.getDate() === p.createdAt.getDate() &&
						f.createdAt.getMonth() === p.createdAt.getMonth() &&
						f.createdAt.getFullYear() === p.createdAt.getFullYear(),
				);

				if (foundedPriceIndex !== -1) {
					filtered[foundedPriceIndex].commission = em.add(
						filtered[foundedPriceIndex].commission,
						p.commission,
					);
					filtered[foundedPriceIndex].count++;
				} else filtered.push({ ...p, count: 1 });
			});
		}

		resolve(filtered);
	});
};

exports.getRegisterChart = async (data, user) => {
	const { start, end } = data;

	const { startAt, endAt } = extractStartAndEndOfDay(start, end);

	const agent = await User.findOne({ where: { id: user._id } });
	if (!agent) throw new HumanError("Agent not found!", 400);

	const query = {
		referredCode: agent.referralCode,
		// "$agentLink.agentId$": user._id,
		// userId: { [Op.ne]: null },
		createdAt: {
			[Op.between]: [startAt, endAt],
		},
	};

	const items = await User.count({
		where: query,
		attributes: [[sequelize.fn("DATE", sequelize.col("createdAt")), "date"]],
		group: ["date"],
	});

	return items;
};

exports.getClickChart = (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { start, end } = data;

		const { startAt, endAt } = extractStartAndEndOfDay(start, end);

		const query = {
			"$agentLink.agentId$": user._id,
			userId: { [Op.eq]: null },
			createdAt: {
				[Op.between]: [startAt, endAt],
			},
		};

		const items = await AgentLinkStatistic.findAll({
			where: query,
			attributes: ["createdAt"],
			raw: true,
			nest: true,
			include: AgentLink,
		});

		const filtered = [];
		if (items.length > 0) {
			items.forEach((p) => {
				const foundedPriceIndex = filtered.findIndex(
					(f) =>
						f.createdAt.getDate() === p.createdAt.getDate() &&
						f.createdAt.getMonth() === p.createdAt.getMonth() &&
						f.createdAt.getFullYear() === p.createdAt.getFullYear(),
				);

				if (foundedPriceIndex !== -1) {
					filtered[foundedPriceIndex].count++;
				} else filtered.push({ createdAt: p.createdAt, count: 1 });
			});
		}

		resolve(filtered);
	});
};

exports.directReferral = async (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { page, limit, sort, order, searchQuery } = data;

		// const offset = (page - 1) * limit;

		// const finalSort = sort;
		// const finalOrder = order;
		let sortObject = { ["createdAt"]: -1 };

		if (sort == "createdAt") {
			sortObject = { ["createdAt"]: order === "DESC" ? -1 : 1 };
		}

		const agent = await User.findOne({ id: user._id });

		if (!agent) throw new HumanError("Agent not found!", 400);

		const query = {
			referredCode: agent.referralCode,
		};

		const result = await User.aggregate([
			//
			{
				$lookup: {
					from: "agentLinkStatistics",
					localField: "_id",
					foreignField: "userId",
					as: "agentLinkStatistics",
				},
			},
			{ $unwind: { path: "$agentLinkStatistics", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "agentLinks",
					localField: "agentLinkStatistics.agentLinkId",
					foreignField: "_id",
					as: "agentLinkStatistics.agentLinkId",
				},
			},
			{ $unwind: { path: "$agentLinkStatistics.agentLinkId", preserveNullAndEmptyArrays: true } },
			{ $match: { $and: [query, { deletedAt: null }] } },
			// { $sort: sortObject },

			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]).collation({ locale: "en" });

		const items = result[0].data;
		const metadata = result[0].metadata[0];

		for (let item of items) {
			let where = { userId: mongoose.Types.ObjectId(item._id) };
			const commissions = await AgentReward.aggregate([
				{
					$lookup: {
						from: "agentLinks",
						localField: "agentLinkId",
						foreignField: "_id",
						as: "agentLinkId",
					},
				},
				{ $match: where },
				{ $unwind: { path: "$agentLinkId", preserveNullAndEmptyArrays: true } },
				{ $group: { _id: "$userId", totalCommission: { $sum: "$commission" } } },
			]).collation({ locale: "en" });

			item["commission"] = commissions.reduce((acc, c) => +acc + +c.totalCommission, 0);
		}

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});
	});
};

exports.totals = (user) => {
	return new Promise(async (resolve, reject) => {
		// const links = await AgentLink.findAll({
		// 	where: { agentId: user._id },
		// 	// attributes: [
		// 	// 	[sequelize.fn("SUM", sequelize.cast(sequelize.col("clickCount"), "integer")), "totalClick"],
		// 	// 	[sequelize.fn("SUM", sequelize.cast(sequelize.col("completedCount"), "integer")), "totalRegister"],
		// 	// ],
		// 	// raw: true,
		// });
		const links = await AgentLink.aggregate([
			{ $match: { agentId: user._id } },
			{
				$group: {
					_id: "$agentId",
					totalClick: { $sum: "$clickCount" },
					totalRegister: { $sum: "$completedCount" },
				},
			},
		]).collation({ locale: "en" });

		//item["commission"] = commissions.reduce((acc, c) => +acc + +c.totalCommission, 0);

		const commissions = await AgentReward.aggregate([
			{
				$lookup: {
					from: "agentLinks",
					localField: "agentLinkId",
					foreignField: "_id",
					as: "agentLinkId",
				},
			},
			{ $match: { agentId: user._id } },
			{ $unwind: { path: "$agentLinkId", preserveNullAndEmptyArrays: true } },
			{ $group: { _id: "$agentId", totalCommission: { $sum: "$commission" } } },
		]).collation({ locale: "en" });
		// const commissions = await AgentReward.findAll({
		// 	where: {
		// 		agentId: user._id,
		// 	},
		// 	attributes: [
		// 		[sequelize.fn("SUM", sequelize.cast(sequelize.col("commission"), "decimal")), "totalCommission"],
		// 	],
		// 	group: "agentReward.id",
		// 	include: { model: AgentLink, attributes: [] },
		// 	raw: true,
		// 	nest: true,
		// });

		const result = {
			totalClick: links[0].totalClick,
			totalRegister: links[0].totalRegister,
			totalCommission: commissions.reduce((acc, c) => +acc + +c.totalCommission, 0),
		};

		resolve(result);
	});
};

exports.clientCommission = (data, user) => {
	return new Promise(async (resolve, reject) => {
		const { page, limit, sort, order, start, end } = data;

		const offset = (page - 1) * limit;

		const query = {
			// "$agentLink.agentId$": user._id,
			deletedAt: null,
			"agentId._id": user._id,
		};

		if (start && end) {
			const { startAt, endAt } = extractStartAndEndOfDay(start, end);

			query.createdAt = { $gte: startAt, $lte: endAt };
		}

		let sortObject = { [sort]: order === "DESC" ? -1 : 1 };
		// if (sort === "price") {
		//     sortObject = {["diamondTypeId.price"]: order === "DESC" ? -1 : 1};
		// }

		const result = await AgentReward.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "userId",
				},
			},
			{ $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },

			{
				$lookup: {
					from: "users",
					localField: "agentId",
					foreignField: "_id",
					as: "agentId",
				},
			},
			{ $unwind: { path: "$agentId", preserveNullAndEmptyArrays: true } },

			{
				$lookup: {
					from: "auctions",
					localField: "auctionId",
					foreignField: "_id",
					as: "auctionId",
				},
			},
			{ $unwind: { path: "$auctionId", preserveNullAndEmptyArrays: true } },

			{
				$lookup: {
					from: "agentLinks",
					localField: "agentLinkId",
					foreignField: "_id",
					as: "agentLinkId",
				},
			},
			{ $unwind: { path: "$agentLinkId", preserveNullAndEmptyArrays: true } },
			{ $match: { $and: [query, { deletedAt: null }] } },
			{ $sort: sortObject },

			{
				$facet: {
					metadata: [{ $count: "total" }, { $addFields: { page } }],
					data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
				},
			},
		]).collation({ locale: "en" });
		const items = result[0].data;
		const metadata = result[0].metadata[0];

		const totalCommission = items.reduce((acc, c) => em.add(+acc, +c.commission), 0);

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
			totalCommission,
		});
	});
};

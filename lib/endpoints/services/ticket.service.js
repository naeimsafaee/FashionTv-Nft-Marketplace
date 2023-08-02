const { NotFoundError, HumanError } = require("../services/errorhandler/index");
const Errors = require("./errorhandler/MessageText");
const {
	Ticket,
	Department,
	ManagerNotification,
	User,
	UserNotification,
	Reply,
	TicketReplyTemplate,
} = require("../../databases/mongodb");
const mongoose = require("mongoose");

const trackingNumber = (pr = "100", su = "TK") => {
	for (let i = 0; i < 5; i++) pr += ~~(Math.random() * 10);
	return pr + su;
};

/**
 * Add a ticket
 * @param
 * @returns
 */
function userAddTicket(userId, title, text, priority, departmentId, files, io) {
	return new Promise(async (resolve, reject) => {
		const generalDepartment = await Department.findOne({
			name: "General",
		}).select("id");

		let data = [];

		if (Object.keys(files).length) {
			//files is name of field that we passed to multer
			for (let key in files.files) {
				let file = files.files[key];

				data.push({
					name: file.newName,
					key: file.key,
					location: file.location,
				});
			}
		}
		const ticketCode = trackingNumber();
		const ticket = await Ticket.create({
			userId,
			title,
			text,
			priority,
			departmentId: generalDepartment.id,
			code: ticketCode,
			status: "CREATED",
			...(data && { file: data }),
		});
		const user = await User.findOne({ _id: userId });

		let content = `User ${
			user.name ? (user.email ? user.email : user.address) : null
		} registered a new ticket with code ${ticketCode} `;
		let notif = await ManagerNotification.create({ title: content, userId: userId, tag: "TICKET" });

		// send notification to admin
		io.to(`Manager`).emit("notification", JSON.stringify(notif));

		resolve(ticket);
	});
}

function userEditTicket(userId, id, title, text, priority, departmentId, files) {
	return new Promise(async (resolve, reject) => {
		let data = [];

		if (Object.keys(files).length) {
			//files is name of field that we passed to multer
			for (let key in files.files) {
				let file = files.files[key];

				data.push({
					name: file.newName,
					key: file.key,
					location: file.location,
				});
			}
		}

		const ticket = await Ticket.findOneAndUpdate(
			{ userId, id },
			{
				$set: {
					...(title && { title: title }),
					...(text && { text: text }),
					...(priority && { priority: priority }),
					...(departmentId && { departmentId: departmentId }),
					...(data && { file: data }),
				},
			},
		);

		if (!ticket.shift())
			throw new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id });
		resolve(ticket);
	});
}

function userGetTickets(data, userId) {
	return new Promise(async (resolve, reject) => {
		const { limit, page, order, sort, priority, departmentId, status } = data;
		let query = { "userId._id": mongoose.Types.ObjectId(userId) };

		if (departmentId) {
			query = { "departmentId._id": mongoose.Types.ObjectId(departmentId) };
		}
		if (priority) query.priority = new RegExp(priority, "i");

		if (status) query.status = status;

		let sortObject = { ["createdAt"]: -1 };

		if (sort == "createdAt") {
			sortObject = { ["createdAt"]: order === "DESC" ? -1 : 1 };
		}
		const result = await Ticket.aggregate([
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
					from: "managers",
					localField: "managerId",
					foreignField: "_id",
					as: "managerId",
				},
			},
			{ $unwind: { path: "$managerId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "departments",
					localField: "departmentId",
					foreignField: "_id",
					as: "departmentId",
				},
			},
			{ $unwind: { path: "$departmentId", preserveNullAndEmptyArrays: true } },
			{ $match: { $and: [query, { deletedAt: null }] } },
			//{ $sort: { $or: [sortObject , {"createdAt" : 1 }] } }
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

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});
	});
}

function userGetTicket(userId, id) {
	return new Promise(async (resolve, reject) => {
		const ticket = await Ticket.findOne({ userId, id })
			.populate({ path: "userId", select: "name address email" })
			.populate({ path: "managerId" })
			.populate({ path: "departmentId" });

		if (!ticket)
			return reject(new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id }));
		resolve(ticket);
	});
}

function userDeleteTicket(userId, id) {
	return new Promise(async (resolve, reject) => {
		let ticket = await Ticket.findOneAndUpdate(
			{ _id: id, userId: userId, deletedAt: null },
			{
				$set: { deletedAt: new Date() },
			},
		);

		if (!ticket)
			return reject(new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id }));
		resolve(ticket);
	});
}

function userChangeTicketStatus(userId, id, status) {
	return new Promise(async (resolve, reject) => {
		const ticket = await Ticket.findOneAndUpdate({ userId, id }, { $set: { status: status } });

		if (!ticket) throw new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id });
		resolve(ticket);
	});
}

function managerAddTicket(managerId, userId, title, text, priority, departmentId, files, io) {
	return new Promise(async (resolve, reject) => {
		let data = [];

		if (files) {
			if (Object.keys(files).length) {
				//files is name of field that we passed to multer
				for (let key in files.files) {
					let file = files.files[key];

					data.push({
						name: file.newName,
						key: file.key,
						location: file.location,
					});
				}
			}
		}

		const ticketCode = trackingNumber();
		const ticket = await Ticket.create({
			userId,
			managerId,
			title,
			text,
			priority,
			departmentId,
			code: ticketCode,
			...(data && { file: data }),
			status: "CREATED",
		});

		const notif = await UserNotification.create({
			userId: userId,
			title: `A new ticket was registered for you with code ${ticketCode}`,
		});

		if (io) {
			io.to(`UserId:${userId}`).emit("notification", JSON.stringify(notif));
		}

		resolve(ticket);
	});
}

function managerEditTicket(isGeneral, managerId, id, title, text, priority, departmentId, note, tag, status, files) {
	return new Promise(async (resolve, reject) => {
		if (!isGeneral && status === "CLOSED") {
			return reject(new HumanError("Only general managers can close ticket", 400, { isGeneral }));
		}

		let data = [];

		if (Object.keys(files).length) {
			//files is name of field that we passed to multer
			for (let key in files.files) {
				let file = files.files[key];

				data.push({
					name: file.newName,
					key: file.key,
					location: file.location,
				});
			}
		}

		const ticket = await Ticket.findOneAndUpdate(
			{ _id: id },
			{
				$set: {
					...(title && { title: title }),
					...(status && { status: status }),
					...(note && { note: note }),
					...(tag && { tag: JSON.parse(tag) }),
					...(text && { text: text }),
					...(priority && { priority: priority }),
					...(departmentId && { departmentId: departmentId }),
					...(data && { file: data }),
				},
			},
		);
		if (!ticket) throw new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id });
		resolve(ticket);
	});
}

function managerGetTickets(userId, data, isGeneral, managerId) {
	return new Promise(async (resolve, reject) => {
		let {
			id,
			type,
			priority,
			departmentId,
			status,
			page,
			limit,
			userName,
			title,
			code,
			departmentName,
			createdAt,
			searchQuery,
			sort,
			order,
		} = data;
		// Get all the departments associated with this manager
		const deptIds = [];
		let query = {};
		if (managerId) {
			query.headManagerId = mongoose.Types.ObjectId(managerId);
		}
		//const count = await Department.countDocuments(query);
		const items = await Department.find(query).lean();

		for (let dept of items) {
			deptIds.push(dept._id);
		}

		let tickets;

		let where = {};
		if (userId) where = { "userId._id": mongoose.Types.ObjectId(userId) };
		if (departmentId) where = { "departmentId._id": mongoose.Types.ObjectId(departmentId) };
		if (userName) where = { "userId.username": new RegExp(userName, "i") };
		if (departmentName) where = { "departmentId.name": new RegExp(departmentName, "i") };
		if (title) where.title = new RegExp(title, "i");
		if (code) where.code = new RegExp(code, "i");
		if (status) where.status = { $in: [...status] };
		if (priority) where.priority = { $in: [...priority] };

		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			where.createdAt = { $gte: start, $lte: end };
		}

		if (!isGeneral) {
			where["$or"] = [
				{
					"departmentId.headManagerId": managerId,
				},
				{
					"departmentId._id": {
						$in: [...deptIds],
					},
				},
			];
		}
		if (searchQuery) {
			where["$or"] = [
				{
					"user.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"user.email": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"user.mobile": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"department.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					"manager.name": {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					title: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
			];
		}
		let sortObject = { ["createdAt"]: -1 };
		if (sort === "updatedAt") {
			sortObject = { ["updatedAt"]: order === "DESC" ? -1 : 1 };
		}

		if (type == "USER") {
			if (id) where = { ...where, "userId._id": mongoose.Types.ObjectId(id) };

			tickets = await Ticket.aggregate([
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
						from: "managers",
						localField: "managerId",
						foreignField: "_id",
						as: "managerId",
					},
				},
				{ $unwind: { path: "$managerId", preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: "departments",
						localField: "departmentId",
						foreignField: "_id",
						as: "departmentId",
					},
				},
				{ $unwind: { path: "$departmentId", preserveNullAndEmptyArrays: true } },
				{ $match: { $and: [where, { deletedAt: null }] } },
				//{ $sort: { $or: [sortObject , {"createdAt" : 1 }] } }
				{ $sort: sortObject },
				{
					$facet: {
						metadata: [{ $count: "total" }, { $addFields: { page } }],
						data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
					},
				},
			]).collation({ locale: "en" });
		} else {
			if (id) where = { ...where, "managetId._id": mongoose.Types.ObjectId(id) };

			////...(id && { managerId: id }),};
			tickets = await Ticket.aggregate([
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
						from: "managers",
						localField: "managerId",
						foreignField: "_id",
						as: "managerId",
					},
				},
				{ $unwind: { path: "$managerId", preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: "departments",
						localField: "departmentId",
						foreignField: "_id",
						as: "departmentId",
					},
				},
				{ $unwind: { path: "$departmentId", preserveNullAndEmptyArrays: true } },
				{ $match: where },
				//{ $sort: { $or: [sortObject , {"createdAt" : 1 }] } }
				{ $sort: sortObject },
				{
					$facet: {
						metadata: [{ $count: "total" }, { $addFields: { page } }],
						data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
					},
				},
			]).collation({ locale: "en" });
		}
		const item = tickets[0].data;
		const metadata = tickets[0].metadata[0];
		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: item,
		});
	});
}

function managerGetTicket(data, id) {
	return new Promise(async (resolve, reject) => {
		const { userId } = data;
		let query = { _id: mongoose.Types.ObjectId(id) };
		if (userId) {
			query = { ...query, userId: mongoose.Types.ObjectId(userId) };
		}
		const ticket = await Ticket.findOne(query)
			.populate({ path: "userId", as: "users", select: "name address email" })
			.populate({ path: "managerId" })
			.populate({ path: "departmentId" });

		if (!ticket) {
			return reject(new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id }));
		}

		resolve(ticket);
	});
}

function managerDeleteTicket(id) {
	return new Promise(async (resolve, reject) => {
		let ticket = await Ticket.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{
				$set: { deletedAt: new Date() },
			},
		);

		if (!ticket)
			return reject(new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id }));
		resolve(ticket);
	});
}

function managerChangeTicketStatus(id, status) {
	return new Promise(async (resolve, reject) => {
		const ticket = await Ticket.findOneAndUpdate({ userId, id }, { $set: { status: status } });
		if (!ticket) throw new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id });
		resolve(ticket);
	});
}

function managerChangeTicketDepartment(id, departmentId) {
	return new Promise(async (resolve, reject) => {
		const ticket = await Ticket.findOneAndUpdate({ _id: id }, { $set: { departmentId, status: "PENDING" } });

		if (!ticket) throw new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id });
		resolve(ticket);
	});
}

function managerAcceptTicket(managerId, id) {
	return new Promise(async (resolve, reject) => {
		const ticket = await Ticket.findOneAndUpdate({ _id: id }, { $set: { managerId } });

		if (!ticket) throw new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { id });
		resolve(ticket);
	});
}

async function userAddReply(userId, ticketId, text, files, io) {
	const ticket = await Ticket.findOne({ _id: ticketId });
	if (!ticket) throw new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { ticketId });
	if (ticket.status === "CLOSED") throw new HumanError("This ticket is currently closed!", 400);

	ticket.status = "PENDING";
	await ticket.save();
	let data = [];

	if (Object.keys(files).length) {
		//files is name of field that we passed to multer
		for (let key in files.files) {
			let file = files.files[key];

			data.push({
				name: file.newName,
				key: file.key,
				location: file.location,
			});
		}
	}

	const reply = await Reply.create({
		userId,
		ticketId,
		text,
		isApproved: true,
		...(data && { file: data }),
	});
	const user = await User.findOne({ _id: userId });
	const ticketData = await Ticket.findOne({ _id: ticketId });

	let content = `User ${
		user.name ? (user.email ? user.email : user.address) : null
	} registered a new answer for the ticket with the code ${ticketData.code} `;

	let notif = await ManagerNotification.create({ title: content, userId: userId, tag: "TICKET" });

	io.to(`Manager`).emit("notification", JSON.stringify(notif));

	return reply;
}

function userEditReply(userId, id, ticketId, text, files) {
	return new Promise(async (resolve, reject) => {
		const ticket = await Ticket.findOne({ _id: ticketId });
		if (ticket.status != "CLOSED") {
			ticket.status = "REPLIED";
			await ticket.save();
			let data = [];

			if (Object.keys(files).length) {
				//files is name of field that we passed to multer
				for (let key in files.files) {
					let file = files.files[key];

					data.push({
						name: file.newName,
						key: file.key,
						location: file.location,
					});
				}
			}

			const reply = await Reply.findOneAndUpdate(
				{
					id,
					userId,
				},
				{
					$set: {
						...(text && { text }),
						...(data && { file: data }),
					},
				},
			);
			if (!reply) throw new NotFoundError(Errors.REPLY_NOT_FOUND.MESSAGE, Errors.REPLY_NOT_FOUND.CODE, { id });
			resolve(reply);
		}
	});
}

async function userGetReplies(userId, data) {
	return new Promise(async (resolve, reject) => {
		const { limit, page, order, sort, ticketId, sortDirection } = data;
		let query = { isApproved: true };

		const ticket = await Ticket.findOne({ _id: ticketId });

		if (ticket && ticket.userId.toString() !== userId.toString()) {
			reject({ message: "This ticket doesn't belong to you" });
		}
		if (userId) {
			query = { ...query, "ticketId.userId._id": mongoose.Types.ObjectId(userId) };
		}

		if (ticketId) {
			query = { ...query, "ticketId._id": mongoose.Types.ObjectId(ticketId) };
		}

		// query.isApproved = true
		let sortObject = { ["updatedAt"]: -1 };
		// if (sort == "immediatePrice") {
		// 	sortObject = { ["price"]: order === "DESC" ? -1 : 1 };
		// }
		if (sort == "createdAt") {
			sortObject = { ["createdAt"]: order === "DESC" ? -1 : 1 };
		}
		const result = await Reply.aggregate([
			{
				$lookup: {
					from: "tickets",
					localField: "ticketId",
					foreignField: "_id",
					as: "ticketId",
				},
			},
			{ $unwind: { path: "$ticketId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "users",
					localField: "ticketId.userId",
					foreignField: "_id",
					as: "ticketId.userId",
				},
			},
			{ $unwind: { path: "$ticketId.userId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "managers",
					localField: "managerId",
					foreignField: "_id",
					as: "managerId",
				},
			},
			{ $unwind: { path: "$managerId", preserveNullAndEmptyArrays: true } },
			{ $match: query },
			//{ $sort: { $or: [sortObject , {"createdAt" : 1 }] } }
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

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});
	});
	// const ticket = await Ticket.findOne({_id: ticketId});

	// if (ticket && ticket.userId !== userId) throw new HumanError("This ticket doesn't belong to you");

	// let offset = (page - 1) * limit;
	// const replies = await Reply.findAndCountAll({
	//     where: {
	//         ...(ticketId && {ticketId: ticketId}),
	//         isApproved: true,
	//     },
	//     offset,
	//     limit,
	//     include: [
	//         {
	//             model: User,
	//             as: "user",
	//             attributes: {exclude: ["password", "salt"]},
	//         },
	//         {
	//             model: Manager,
	//             as: "manager",
	//         },
	//     ],
	//     order: [["updatedAt", sortDirection]],
	// });
	// return {
	//     total: replies.count,
	//     pageSize: limit,
	//     page,
	//     data: replies.rows,
	// };
}

function userGetReply(userId, id) {
	return new Promise(async (resolve, reject) => {
		const reply = await Reply.findOne({ userId, id })
			.populate({ path: "userId", select: "name address email" })
			.populate({ path: "managerId" });

		if (!reply)
			return reject(new NotFoundError(Errors.REPLY_NOT_FOUND.MESSAGE, Errors.REPLY_NOT_FOUND.CODE, { id }));
		resolve(reply);
	});
}

function userDeleteReply(userId, id) {
	return new Promise(async (resolve, reject) => {
		let reply = await Reply.findOneAndUpdate(
			{ _id: id, userId: userId, deletedAt: null },
			{
				$set: { deletedAt: new Date() },
			},
		);

		if (!reply)
			return reject(new NotFoundError(Errors.REPLY_NOT_FOUND.MESSAGE, Errors.REPLY_NOT_FOUND.CODE, { id }));
		resolve(reply);
	});
}

async function managerAddReply(req, managerId, isGeneral, ticketId, text, files, io) {
	const ticket = await Ticket.findOne({ _id: ticketId });

	if (!ticket) throw new NotFoundError(Errors.TICKET_NOT_FOUND.MESSAGE, Errors.TICKET_NOT_FOUND.CODE, { ticketId });

	if (isGeneral) ticket.status = "REPLIED";
	else ticket.status = "REVIEW";

	ticket.managerId = managerId;
	await ticket.save();
	let data = [];

	if (Object.keys(files).length) {
		//files is name of field that we passed to multer
		for (let key in files.files) {
			let file = files.files[key];

			data.push({
				name: file.newName,
				key: file.key,
				location: file.location,
			});
		}
	}

	const reply = await Reply.create({
		managerId,
		ticketId,
		text,
		isApproved: isGeneral ? true : false,
		...(data && { file: data }),
	});

	if (isGeneral) {
		const ticketData = await Ticket.findOne({ _id: ticketId });
		const user = await User.findOne({ _id: ticketData.userId });
		const notif = await UserNotification.create({
			userId: ticketData.userId,
			title: `A new answer was registered for the ticket with the code ${ticketData.code}`,
			flash: false,
			status: false,
		});

		if (io) {
			io.to(`UserId:${user.id}`).emit("notification", JSON.stringify(notif));
		}

		// if (user.email) {
		//     await ticketMail(
		//         user.email,
		//         ticketData.code,
		//         config.get("app.cors.origin") + `/profile/ticket/${ticketData.id}`,
		//     );
		// }
	}

	return reply;
}

function managerEditReply(managerId, id, ticketId, text, files) {
	return new Promise(async (resolve, reject) => {
		const ticket = await Ticket.findOne({ _id: ticketId });
		if (ticket.status != "CLOSED") {
			ticket.status = "REPLIED";
			ticket.managerId = managerId;
			await ticket.save();
			let data = [];

			if (Object.keys(files).length) {
				//files is name of field that we passed to multer
				for (let key in files.files) {
					let file = files.files[key];

					data.push({
						name: file.newName,
						key: file.key,
						location: file.location,
					});
				}
			}

			const reply = await Reply.findOneAndUpdate(
				{
					id,
					managerId,
				},
				{
					$set: {
						...(text && { text }),
						...(data && { file: data }),
					},
				},
			);
			if (!reply) throw new NotFoundError(Errors.REPLY_NOT_FOUND.MESSAGE, Errors.REPLY_NOT_FOUND.CODE, { id });
			resolve(reply);
		}
	});
}

function managerApproveReply(id, text, isGeneral, io) {
	return new Promise(async (resolve, reject) => {
		if (!isGeneral) {
			return reject(new HumanError("Only general managers can approve reply", 400, { isGeneral }));
		}

		const reply = await Reply.findOne({ _id: id });

		if (!reply) {
			return reject(new NotFoundError(Errors.REPLY_NOT_FOUND.MESSAGE, Errors.REPLY_NOT_FOUND.CODE, { id }));
		}

		reply.text = text;
		reply.isApproved = true;

		await reply.save();

		await Ticket.findOneAndUpdate(
			{
				_id: reply.ticketId,
			},
			{
				$set: {
					status: "REPLIED",
				},
			},
		);

		const ticketData = await Ticket.findOne({ _id: reply.ticketId });
		const user = await User.findOne({ _id: ticketData.userId });

		const notif = await UserNotification.create({
			userId: ticketData.userId,
			title: `A new answer was registered for the ticket with the code ${ticketData.code}`,
			flash: false,
			status: false,
		});

		if (io) {
			io.to(`UserId:${user.id}`).emit("notification", JSON.stringify(notif));
		}

		// if (user.email) {
		//     await ticketMail(
		//         user.email,
		//         ticketData.code,
		//         config.get("app.cors.origin") + `/profile/ticket/${ticketData.id}`,
		//     );
		// }

		resolve(reply);
	});
}

function managerGetReplies(data) {
	return new Promise(async (resolve, reject) => {
		const { limit, page, order, sort, ticketId, sortDirection } = data;
		let query = {};

		if (ticketId) {
			query = { "ticketId._id": mongoose.Types.ObjectId(ticketId) };
		}

		let sortObject = { ["updatedAt"]: -1 };

		if (sort == "createdAt") {
			sortObject = { ["createdAt"]: order === "DESC" ? -1 : 1 };
		}
		const result = await Reply.aggregate([
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
					from: "tickets",
					localField: "ticketId",
					foreignField: "_id",
					as: "ticketId",
				},
			},
			{ $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: "managers",
					localField: "managerId",
					foreignField: "_id",
					as: "managerId",
				},
			},
			{ $unwind: { path: "$managerId", preserveNullAndEmptyArrays: true } },
			{ $match: { $and: [query, { deletedAt: null }] } },
			//{ $sort: { $or: [sortObject , {"createdAt" : 1 }] } }
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

		resolve({
			total: metadata?.total ?? 0,
			pageSize: limit,
			page: metadata?.page ?? page,
			data: items,
		});
	});
}

function managerGetReply(id) {
	return new Promise(async (resolve, reject) => {
		const reply = await Reply.findOne({ _id: id, deletedAt: null })
			.populate({ path: "userId" })
			.populate({ path: "managerId" });

		if (!reply)
			return reject(new NotFoundError(Errors.REPLY_NOT_FOUND.MESSAGE, Errors.REPLY_NOT_FOUND.CODE, { id }));
		resolve(reply);
	});
}

function managerDeleteReply(id) {
	return new Promise(async (resolve, reject) => {
		const reply = await Reply.findOneAndUpdate({ _id: id }, { $set: { deletedAt: new Date() } });

		if (!reply)
			return reject(new NotFoundError(Errors.REPLY_NOT_FOUND.MESSAGE, Errors.REPLY_NOT_FOUND.CODE, { id }));
		resolve("Successful");
	});
}

// Ticket Template

async function managerGetReplyTemplates(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, id, name } = data;
		const query = { deletedAt: null };

		if (id) {
			query._id = mongoose.Types.ObjectId(id);
		}
		if (name) query.name = new RegExp(name, "i");

		const count = await TicketReplyTemplate.countDocuments(query);
		const items = await TicketReplyTemplate.find(query)
			.select("-__v")
			.sort({ [sort]: order })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		resolve({
			total: count ?? 0,
			pageSize: limit,
			page,
			data: items,
		});

		// const result = await TicketReplyTemplate.findAndCountAll({
		//     where: query,
		//     limit,
		//     offset,
		//     attributes: {exclude: ["deletedAt", "updatedAt"]},
		//     order: [[sort, order]],
		// });
		// resolve({
		//     total: result.count,
		//     pageSize: limit,
		//     page,
		//     data: result.rows,
		// });
	});
}

function managerGetReplyTemplateById(id) {
	return new Promise(async (resolve, reject) => {
		let result = await TicketReplyTemplate.findOne({ _id: id, deletedAt: null });

		if (!result)
			return reject(
				new NotFoundError(Errors.REPLY_TEMPLATE_NOT_FOUND.MESSAGE, Errors.REPLY_TEMPLATE_NOT_FOUND.CODE, {
					id,
				}),
			);

		return resolve(result);
	});
}

function managerAddReplyTemplate(data) {
	return new Promise(async (resolve, reject) => {
		const { name, text } = data;

		const existReplyTemplate = await TicketReplyTemplate.findOne({ name });
		if (existReplyTemplate)
			return reject(
				new HumanError(Errors.DUPLICATE_REPLY_TEMPLATE.MESSAGE, Errors.DUPLICATE_REPLY_TEMPLATE.CODE, { name }),
			);

		const result = await TicketReplyTemplate.create({
			name,
			text,
		});

		if (!result) return reject(new HumanError(Errors.ADD_FAILED.MESSAGE, Errors.ADD_FAILED.CODE));

		resolve("Successful");
	});
}

function managerDeleteReplyTemplate(id) {
	return new Promise(async (resolve, reject) => {
		const result = await TicketReplyTemplate.findOneAndUpdate({ _id: id }, { $set: { deletedAt: new Date() } });

		if (!result)
			return reject(
				new NotFoundError(Errors.REPLY_TEMPLATE_NOT_FOUND.MESSAGE, Errors.REPLY_TEMPLATE_NOT_FOUND.CODE, {
					id,
				}),
			);

		return resolve("Successful");
	});
}

module.exports = {
	userAddTicket,
	userEditTicket,
	userGetTickets,
	userGetTicket,
	userDeleteTicket,
	userChangeTicketStatus,
	managerAddTicket,
	managerEditTicket,
	managerGetTickets,
	managerGetTicket,
	managerDeleteTicket,
	managerChangeTicketStatus,
	managerChangeTicketDepartment,
	managerAcceptTicket,
	userAddReply,
	userEditReply,
	userGetReplies,
	userGetReply,
	userDeleteReply,
	managerAddReply,
	managerEditReply,
	managerApproveReply,
	managerGetReplies,
	managerGetReply,
	managerDeleteReply,
	managerGetReplyTemplates,
	managerGetReplyTemplateById,
	managerAddReplyTemplate,
	managerDeleteReplyTemplate,
};

const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { ContactUs } = require("../../databases/mongodb");
const { dateQueryBuilder } = require("../../utils/dateQueryBuilder");

function addContactUs(title, description, email) {
	return new Promise(async (resolve, reject) => {
		const result = await ContactUs.create({
			title,
			description,
			email,
		});

		if (!result) return reject(new HumanError(Errors.CONTACT_US_FAILED.MESSAGE, Errors.CONTACT_US_FAILED.CODE));

		resolve("Successful");
	});
}

function deleteContactUs(id) {
	return new Promise(async (resolve, reject) => {
		const result = await ContactUs.findOneAndUpdate(
			{ _id: id, deletedAt: null },
			{ $set: { deletedAt: new Date() } },
		);

		if (!result)
			return reject(
				new NotFoundError(Errors.CONTACT_US_NOT_FOUND.MESSAGE, Errors.CONTACT_US_NOT_FOUND.CODE, { id }),
			);

		return resolve("Successful");
	});
}

async function getOneContactUs(id) {
	return new Promise(async (resolve, reject) => {
		const result = await ContactUs.findOne({ _id: id, deletedAt: null }).lean();

		if (!result)
			return reject(
				new NotFoundError(Errors.CONTACT_US_NOT_FOUND.MESSAGE, Errors.CONTACT_US_NOT_FOUND.CODE, { id }),
			);

		return resolve(result);
	});
}

function getAllContactUs(data) {
	return new Promise(async (resolve, reject) => {
		const { page, limit, order, sort, title, description, email, searchQuery, createdAt } = data;

		const query = {
			deletedAt: null,
		};

		if (searchQuery) {
			query.$or = [
				{
					title: {
						$regex: searchQuery || "",
						$options: "i",
					},
				},
				{
					description: { $regex: searchQuery || "", $options: "i" },
				},
				{
					email: { $regex: searchQuery || "", $options: "i" },
				},
			];
		}

		if (title) {
			query.title = {
				$regex: title || "",
				$options: "i",
			};
		}

		if (email) {
			query.email = {
				$regex: email || "",
				$options: "i",
			};
		}

		if (description) {
			query.description = {
				$regex: description || "",
				$options: "i",
			};
		}

		if (createdAt) {
			const { start, end } = dateQueryBuilder(createdAt);
			query.createdAt = { $gte: start, $lte: end };
		}

		const count = await ContactUs.countDocuments(query);
		const items = await ContactUs.find(query)
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
	});
}

module.exports = {
	addContactUs,
	deleteContactUs,
	getOneContactUs,
	getAllContactUs,
};

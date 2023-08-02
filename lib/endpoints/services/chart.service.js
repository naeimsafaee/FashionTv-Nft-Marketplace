const { NotFoundError, HumanError } = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const { User } = require("../../databases/mongodb");
const moment = require("moment");
const enumerateDaysBetweenDates = function (startDate, endDate) {
	startDate = moment(startDate);
	endDate = moment(endDate);

	var now = startDate,
		dates = [];

	while (now.isBefore(endDate) || now.isSame(endDate)) {
		dates.push({
			date: now.format("YYYY-MM-DD"),
			count: 0,
		});
		now.add(1, "days");
	}
	return dates;
};

/**
 * get User Chart
 * @param {*} date
 * @returns
 */
function UserChart(fromDate, toDate) {
	return new Promise(async (resolve, reject) => {
		const dates = enumerateDaysBetweenDates(fromDate, toDate);

		const users = await User.aggregate([
			{
				$match: {
					$and: [{ createdAt: { $gte: new Date(fromDate) } }, { createdAt: { $lte: new Date(toDate) } }],
				},
			},
			{
				$group: {
					_id: {
						dateYMD: {
							$dateFromParts: {
								day: { $dayOfMonth: "$_id" },
								month: { $month: "$_id" },
								year: { $year: "$_id" },
							},
						},
					},
					count: { $sum: 1 },
				},
			},
			{
				$sort: { "_id.dateYMD": -1 },
			},
			{
				$project: {
					_id: 0,
					count: 1,
					dateDMY: { $dateToString: { date: "$_id.dateYMD", format: "%Y-%m-%d" } },
				},
			},
		]);
		const newUserDate = users.map((item) => {
			return {
				date: item.dateDMY,
				count: item.count,
			};
		});

		const pattern = { date: null, count: null };
		const concatArray = Object.values(
			newUserDate.reduce(
				(r, o) => {
					r[o.date] = r[o.date] || [{ ...pattern }];
					r[o.date].forEach((p) => Object.assign(p, o));
					return r;
				},
				dates.reduce((r, o) => {
					(r[o.date] = r[o.date] || []).push({ ...pattern, ...o });
					return r;
				}, {}),
			),
		)
			.flat()
			.reduce((r, o, i, { [i - 1]: prev }) => {
				if (!r) return [o];
				var p = new Date(prev.date).getTime() + 1000 * 60 * 60 * 24;
				while (p < new Date(o.date).getTime()) {
					let d = new Date();
					d.setTime(p);
					r.push({ ...pattern, date: d.toISOString().slice(0, 10) });
					p += 1000 * 60 * 60 * 24;
				}
				r.push(o);
				return r;
			}, undefined);

		return resolve({
			user: concatArray,
		});
	});
}

function Counts() {
	return new Promise(async (resolve, reject) => {
		const totalUsers = await User.count({
			deletedAt: null,
		});

		return resolve({
			totalUsers,
		});
	});
}
module.exports = {
	UserChart,
	Counts,
};

exports.dateQueryBuilder = (date) => {
	const start = new Date(date);
	const end = new Date(date);
	start.setUTCHours(0, 0, 0, 0);
	end.setUTCHours(23, 59, 59, 999);

	return { start, end };
};
exports.extractStartAndEndOfDay = (start, end) => {
	const startAt = new Date(start);
	startAt.setUTCHours(0, 0, 0, 0);
	const endAt = new Date(end);
	endAt.setUTCHours(23, 59, 59, 999);
	return { startAt, endAt };
};

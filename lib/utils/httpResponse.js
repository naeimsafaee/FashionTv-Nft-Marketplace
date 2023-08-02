const httpStatus = require("http-status");
const response = ({
	res,
	statusCode = httpStatus.OK,
	status = "success",
	message = null,
	data = null,
	error = null,
}) => {
	return res.status(statusCode).json({
		status,
		message,
		data,
		error,
	});
};

const handdleApiError = (res, e) => {
	const eArray = e.message.split("|");

	if (process.env.NODE_ENV == "development") {
		console.log("*** API Error: ", eArray[0]);
		console.log(e);
	} else {
		// ignore all database error by port
		if (e?.original?.port === 5432) e.message = "An error has occurred!";
		// ignore all redis error by port
		if (e?.original?.port === 6379) e.message = "An error has occurred!";
	}

	return response({
		res,
		statusCode: httpStatus?.[eArray[0]] ?? 500,
		status: "error",
		error: eArray[1] ?? e.message,
	});
};

module.exports = {
	response,
	apiError: handdleApiError,
};

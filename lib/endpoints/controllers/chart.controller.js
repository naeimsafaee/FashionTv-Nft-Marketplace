const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("./../../utils");
const { chartService } = require("../services");

/**
 * get User Chart
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.UserChart = async (req, res) => {
	const { fromDate, toDate } = req.query;

	const data = await chartService.UserChart(fromDate, toDate);
	return response({ res, statusCode: httpStatus.ACCEPTED, data });
};
/**
 * get Counts
 * @param {*} req
 * @param {*} res
 * @returns
 */
exports.UserCounts = async (req, res) => {
	const data = await chartService.Counts();
	return response({ res, statusCode: httpStatus.ACCEPTED, data });
};

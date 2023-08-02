const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { brandService } = require("../services");

exports.addBrand = async (req, res) => {
	try {
		const { title, link } = req.body;
		const data = await brandService.addBrand(title, link, req.files);
		return response({ res, statusCode: httpStatus.CREATED, data });
	} catch (e) {
		console.log(e);
		return res.status(e.statusCode).json(e);
	}
};

exports.editBrand = async (req, res) => {
	try {
		const { id, title, link } = req.body;
		const data = await brandService.editBrand(id, title, link, req.files);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.deleteBrand = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await brandService.deleteBrand(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getBrand = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await brandService.getBrand(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getBrands = async (req, res) => {
	try {
		const data = await brandService.getBrands(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getBrandByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await brandService.getBrandByManager(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getBrandsByManager = async (req, res) => {
	try {
		const data = await brandService.getBrandsByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

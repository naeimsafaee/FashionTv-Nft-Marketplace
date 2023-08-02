const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");

const { categoryService } = require("../services");

exports.addCategory = async (req, res) => {
	try {
		const { title, description, type } = req.body;
		const data = await categoryService.addCategory(title, description, type, req.files);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getCategories = async (req, res) => {
	try {
		const { page, limit, order, sort, title, description, createdAt, type } = req.query;
		const data = await categoryService.getCategories(page, limit, order, sort, title, description, createdAt, type);

		// const data = [
		// 	{
		// 		title: "Designers Accessories",
		// 		icon: {
		// 			dark: "https://volex.s3.amazonaws.com/category/images/ec1c858b-26a2-439b-98cd-fbcfc0a4a54d.svg",
		// 			light: "https://volex.s3.eu-central-1.amazonaws.com/category/images/d9921d3e-8d49-44b1-ae7c-4663c5fc2788.svg",
		// 		},
		// 	},
		// 	{
		// 		title: "Clothing",
		// 		icon: {
		// 			dark: "https://volex.s3.amazonaws.com/category/images/7bc6805c-2f0b-4ebe-93ac-bd217a7d2d15.svg",
		// 			light: "https://volex.s3.eu-central-1.amazonaws.com/category/images/861ac9ca-a706-4099-b51a-b3ec6656f560.svg",
		// 		},
		// 	},
		// 	{
		// 		title: "Decor",
		// 		icon: {
		// 			dark: "https://volex.s3.amazonaws.com/category/images/e681cfd1-dc62-484e-b4a7-7f82c9fcac42.svg",
		// 			light: "https://volex.s3.amazonaws.com/category/images/dadff515-ad77-4682-af4f-6d08d20f0a52.svg",
		// 		},
		// 	},
		// 	{
		// 		title: "Lifestyle",
		// 		icon: {
		// 			dark: "https://volex.s3.amazonaws.com/category/images/6bb02c75-f44b-4967-a7cf-2b91a9ae3dd7.svg",
		// 			light: "https://volex.s3.amazonaws.com/category/images/18b159c9-10be-4868-a086-32b35b8d925d.svg",
		// 		},
		// 	},
		// 	{
		// 		title: "Music",
		// 		icon: {
		// 			dark: "https://volex.s3.amazonaws.com/category/images/cfa93a24-88bf-4fba-9187-518cf535003d.svg",
		// 			light: "https://volex.s3.amazonaws.com/category/images/8dce00d7-613c-4e3e-bff8-b1e7be2f9c6a.svg",
		// 		},
		// 	},
		// 	{
		// 		title: "Art",
		// 		icon: {
		// 			dark: "https://volex.s3.amazonaws.com/category/images/2213989a-dd3d-43c0-8736-bfe1c5f33f86.svg",
		// 			light: "https://volex.s3.eu-central-1.amazonaws.com/category/images/c5ae8333-f911-43b2-94f8-2039e81846d1.svg",
		// 		},
		// 	},
		// 	{
		// 		title: "Beauty",
		// 		icon: {
		// 			dark: "https://volex.s3.amazonaws.com/category/images/764b7785-95e0-417f-a4ca-17f0ca8cfe49.svg",
		// 			light: "https://volex.s3.eu-central-1.amazonaws.com/category/images/8c84b3c5-8f02-47db-ace0-c250b69bc367.svg",
		// 		},
		// 	},
		// 	{
		// 		title: "Trends",
		// 		icon: {
		// 			dark: "https://volex.s3.amazonaws.com/category/images/c880777f-1036-4e15-88a1-815756f8dbd6.svg",
		// 			light: "https://volex.s3.amazonaws.com/category/images/257dd2ec-f4d1-46a3-9128-0db80e02febc.svg",
		// 		},
		// 	},
		// 	{
		// 		title: "Antique",
		// 		icon: {
		// 			dark: "https://volex.s3.eu-central-1.amazonaws.com/category/images/23a5e1e9-1905-49b7-b40c-a0971e546595.svg",
		// 			light: "https://volex.s3.eu-central-1.amazonaws.com/category/images/147fb625-1409-4b03-9111-cc3f3e2c6c43.svg",
		// 		},
		// 	},
		// ];
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await categoryService.getCategory(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.editCategory = async (req, res) => {
	try {
		const { id, title, description, type } = req.body;
		const data = await categoryService.editCategory(id, title, description, type, req.files);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.deleteCategory = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await categoryService.deleteCategory(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.categorySelector = async (req, res) => {
	try {
		const { page, limit, order, sort, searchQuery } = req.query;
		const data = await categoryService.categorySelector(page, limit, order, sort, searchQuery);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getCategoriesByManager = async (req, res) => {
	try {
		const data = await categoryService.getCategoriesByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getCategoryByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await categoryService.getCategoryByManager(id);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.categorySelectorByManager = async (req, res) => {
	try {
		const data = await categoryService.categorySelectorByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

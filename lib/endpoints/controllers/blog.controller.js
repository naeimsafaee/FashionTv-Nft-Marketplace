const {
	httpResponse: { response, apiError },
	httpStatus,
} = require("../../utils");
const { blogService } = require("../services");

exports.addBlog = async (req, res) => {
	try {
		const { status, category, title, description, text, isHome, video, type } = req.body;
		const data = await blogService.addBlog(
			status,
			category,
			title,
			text,
			description,
			req.files,
			isHome,
			video,
			type,
		);
		return response({ res, statusCode: httpStatus.CREATED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.editBlog = async (req, res) => {
	try {
		const { id, status, text, images, thumbnails, category, title, description, isHome, video, type } = req.body;
		const data = await blogService.editBlog(
			id,
			title,
			description,
			text,
			images,
			thumbnails,
			category,
			status,
			req.files,
			isHome,
			video,
			type,
		);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.deleteBlog = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await blogService.deleteBlog(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getBlog = async (req, res) => {
	try {
		const { slug } = req.params;
		const data = await blogService.getBlog(slug);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getBlogs = async (req, res) => {
	try {
		const data = await blogService.getBlogs(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.recommendedBlogs = async (req, res) => {
	try {
		const data = await blogService.recommendedBlogs(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.blogSelector = async (req, res) => {
	try {
		const { page, limit, order, searchQuery, type, category } = req.query;
		const data = await blogService.blogSelector(page, limit, order, searchQuery, type, category);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.likeBlog = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await blogService.likeBlog(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getBlogCategories = async (req, res) => {
	try {
		const data = await blogService.blogCategories(req.query);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

// exports.relatedBlogs = async (req, res) => {
// 	try {
// 		const { id, lang } = req.query;
// 		const data = await blogService.relatedBlogs(id, lang);
// 		return response({ res, statusCode: httpStatus.ACCEPTED, data });
// 	} catch (e) {
// 		return res.status(e.statusCode).json(e);
// 	}
// };

exports.getBlogByManager = async (req, res) => {
	try {
		const { id } = req.params;
		const data = await blogService.getBlogByManager(id);
		return response({ res, statusCode: httpStatus.ACCEPTED, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.getBlogsByManager = async (req, res) => {
	try {
		const data = await blogService.getBlogsByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

exports.blogSelectorByManager = async (req, res) => {
	try {
		const data = await blogService.blogSelectorByManager(req.query);
		return response({ res, statusCode: httpStatus.OK, data });
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

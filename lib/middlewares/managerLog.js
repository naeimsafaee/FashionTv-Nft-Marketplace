const { MangerLog } = require("../databases/mongodb");

exports.managerLog = (permission) => async (req, res, next) => {
	try {
		await MangerLog.create({
			managerId: req.userEntity.id,
			action: permission,
		});

		next();
	} catch (e) {
		return res.status(e.statusCode).json(e);
	}
};

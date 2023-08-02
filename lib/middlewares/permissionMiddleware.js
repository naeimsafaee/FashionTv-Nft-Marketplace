const { hasPermissionThroughRole, hasPermission } = require("../endpoints/services/permission");
const { NotAuthorizedError } = require("../endpoints/services/errorhandler");
const Errors = require("../endpoints/services/errorhandler/MessageText");

function throwError() {
	throw new NotAuthorizedError(Errors.NOT_AUTHORIZE.CODE, Errors.NOT_AUTHORIZE.MESSAGE);
}

exports.permissionMiddleware = (permission) => async (req, res, next) => {
	try {
		if (req.userEntity.isSuperadmin) return next();

		const userHasPermissionThroughRole = await hasPermissionThroughRole(req.userEntity?._id, permission);
		// const userHasPermission = await hasPermission(req.userEntity?.id, permission);

		if (userHasPermissionThroughRole) {
			next();
		} else {
			throwError();
		}
	} catch (e) {
		console.log(e);
		if (!e.statusCode) return res.status(500).json(e);
		return res.status(e.statusCode).json(e);
	}
};

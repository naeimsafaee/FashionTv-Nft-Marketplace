const { Manager, Permission } = require("../../../databases/mongodb");

exports.hasPermissionThroughRole = async (id, permission) => {
	const manager = await Manager.findOne({ _id: id }).populate({ path: "roleId" });

	const managerPermissions = manager.roleId.permissions;

	const per = await Permission.findOne({ name: permission });

	const data = managerPermissions.filter(function (itemOne) {
		return itemOne.toString() === per._id.toString();
	});


	// diamonds = diamonds.filter((diamond) => {
	//     return diamond.diamondId !== null
	// })

	return data?.length > 0 ? true : false;
};

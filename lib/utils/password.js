const bcrypt = require("bcrypt");

exports.generate = async (password) => {
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(password, salt);
	return { password, salt, hash };
};

exports.validate = async (password, salt, hash) => {
	try {
		const _hash = await bcrypt.hash(password, salt);
		if (hash == _hash) return true;
		else return false;
	} catch (e) {
		return false;
	}
};

exports.testRegex = (password) => {
	return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,64}$/.test(password);
};

const router = require("express").Router();

module.exports = (app) => {
	router.use("/manager", require("./manager.routes"));
	router.use("/user", require("./user.routes"));
	router.use("/public", require("./public.routes"));
	router.use("/swap", require("./swap.routes"));
	router.use("/wallet", require("./wallet.routes"));
	router.use("/asset", require("./asset.routes"));
	router.use("/agent", require("./agent.routes"));


	app.use("/api", router);
};

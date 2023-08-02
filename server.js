require("dotenv").config();
require("./cron");

process.on("uncaughtException", (ex) => {
	console.log(ex);
	// throw ex;
});
process.on("unhandledRejection", (ex) => {
	console.log(ex);
	// throw ex;
});

const config = require("config");
const serverConfig = config.get("server");
const socketService = require("./lib/endpoints/services/socket.service");

var app = require("./lib/app");

console.log(`*** SERVER Info: ENVIRONMENT: ${process.env.NODE_ENV}`);
console.log(`*** SERVER Info: Please wait; Starting...`);

const server = app.listen(serverConfig.port, async () => {
	console.log(`*** SERVER Info: Server is running on port ${serverConfig.port}...`);
	new socketService(server, app).run();
});

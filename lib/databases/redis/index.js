const config = require("config");
const Redis = require("ioredis");

const client = new Redis({ ...config.get("databases.redis.cache") });

client.on("error", (e) => {
	console.log("*** REDIS Error: Can not connect! " + e);
});

client.on("connect", () => {
	console.log("*** REDIS Info: Connected.");
});

module.exports = {
	client,
	Redis,
};

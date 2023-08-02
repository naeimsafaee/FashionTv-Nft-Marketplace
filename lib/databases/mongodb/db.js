const mongoose = require("mongoose");
const connectionString = require("config").get("databases.mongodb");

const isDev = process.env.NODE_ENV === "development";
// connect to mongodb server
mongoose.connect(connectionString, { useNewUrlParser: true }, (err) => {
	if (!err) {
		console.log("*** env : " , process.env.NODE_ENV);
		console.log("*** MongoDB Connection: Successfully");

		// register db triggers
		require("./init")();

	} else console.log("*** MongoDB Error: ", JSON.stringify(err, undefined, 2));
});

mongoose.set("debug", false);
mongoose.pluralize(null);

module.exports = mongoose;

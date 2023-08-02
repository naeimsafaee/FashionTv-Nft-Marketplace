require("express-async-errors");
const app = require("express")();
const { publicController } = require("./endpoints/controllers");

require("./middlewares").appMiddlewares(app);
require("./endpoints/routes")(app);
app.get("/nft/:filename", publicController.attributes);
app.use(require("./middlewares/errorMiddleware"));


module.exports = app;

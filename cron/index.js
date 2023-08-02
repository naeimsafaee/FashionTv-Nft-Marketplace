/*
| Author : Mohammad Ali Ghazi
| Email  : mohamadalghazy@gmail.com
| Date   : Sat Apr 09 2022
| Time   : 9:54:29 AM
 */

// const { postgres } = require("../lib/databases");
const CronJob = require("cron").CronJob;
const axios = require("axios");
const polygonApiKey = require("config").get("apiKey.polygon.key");

global.PolygonGasPrice;

// var job = new CronJob("* * * * * *", async () => {
// 	axios
// 		.get(`https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey=${polygonApiKey}`)
// 		.then((res) => (PolygonGasPrice = res?.data?.result?.FastGasPrice));
// });
// // Use this if the 4th param is default value(false)
// job.start();

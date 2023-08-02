const postgres = require("../../databases/mongodb");

async function GetAllCurrency() {

    const data = await postgres.Currency.find({})
    return data;
}


module.exports = {
    GetAllCurrency
};

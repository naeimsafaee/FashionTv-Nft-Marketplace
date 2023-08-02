
const { GetAllCurrency } = require("./../../services/CurrencyService");


exports.getAllCurrency = async (req , res) => {
    return res.send(await GetAllCurrency());
};


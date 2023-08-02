const Joi = require("joi");

const purchaseDiamond = {
    body: {
        auctionId: Joi.string().required()
    },
};

module.exports = {
    purchaseDiamond,
};

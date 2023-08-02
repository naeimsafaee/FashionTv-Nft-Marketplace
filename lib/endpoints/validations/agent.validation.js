const Joi = require("joi");

const login = {
    body: {
        mobile: Joi.string().min(8).max(20),
        email: Joi.string().email(),
        password: Joi.string().required(),
    },
};

const statistic = {
    query: {
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
    },
};

const statisticDetails = {
    query: {
        userId: Joi.string(),
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
    },
};

module.exports = {
    login,
    statistic,
    statisticDetails,
};

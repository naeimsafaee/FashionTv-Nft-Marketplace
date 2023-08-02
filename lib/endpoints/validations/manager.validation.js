
const Joi = require("joi");

const getManagers = {
    query: {
        id: Joi.number(),
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
        order: Joi.valid("DESC", "ASC").default("DESC"),
        name: Joi.string(),
        mobile: Joi.string(),
        email: Joi.string(),
        status: Joi.array().items(Joi.valid("1", "2")),
        rule: Joi.array().items(Joi.valid("1", "2", "3"))
    }
};

const addManagers = {
    body: {
        name: Joi.string().allow(null).empty(),
        mobile: Joi.string().allow(null).empty(),
        email: Joi.string().allow(null).empty(),
        password: Joi.string().required(),
        status: Joi.valid("1", "2"),
        roleId: Joi.number()
    }
};

const editManagers = {
    body: {
        id: Joi.number().required(),
        name: Joi.string().allow(null).empty(),
        mobile: Joi.string().allow(null).empty(),
        email: Joi.string().allow(null).empty(),
        password: Joi.string().allow(null).empty(),
        status: Joi.valid("1", "2"),
        roleId: Joi.number()
    }
};

const findManagerById = {
    params: {
        id: Joi.number().required()
    }
};

const getRoles = {
    query: {
        id: Joi.number(),
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
        order: Joi.valid("DESC", "ASC").default("DESC"),
        name: Joi.string(),
        nickName: Joi.string(),
    },
};


module.exports = {
    addManagers,
    editManagers,
    getManagers,
    findManagerById,
    getRoles
};

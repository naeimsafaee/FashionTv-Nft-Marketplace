const {mongodb} = require("../../databases");
const {NotFoundError, HumanError, InvalidRequestError, ConflictError} = require("./errorhandler");
const {password} = require("../../utils");
const Errors = require("./errorhandler/MessageText");
const {default: axios} = require("axios");


// Role
function createRole(name, nickName, permissions) {
    return new Promise(async (resolve, reject) => {
        const newRole = await mongodb.Role.create({name, nickName});
        const getPermissions = await mongodb.Permission.findAll({
            where: {
                name: permissions,
            },
        });

        await newRole.addPermission(getPermissions);

        return resolve("Successful");
    });
}

function updateRole(data) {
    return new Promise(async (resolve, reject) => {
        const role = await mongodb.Role.findOne({
            where: {id: data.id},
            include: [{model: mongodb.Permission, nested: true}],
        });
        await role.removePermission(role.permissions);
        const updatedRole = await mongodb.Role.update(data, {
            where: {id: data.id},
        });
        const getPermissions = await mongodb.Permission.findAll({
            where: {
                name: data.permissions,
            },
        });
        await role.addPermission(getPermissions);
        return resolve("Successful");
    });
}

function findRoleById(id) {
    return new Promise(async (resolve, reject) => {
        const role = await mongodb.Role.findOne({
            where: {id},
            include: [{model: mongodb.Permission, nested: true}],
        });

        return resolve(role);
    });
}

/**
 * delete Role
 * @param {*} id
 * @returns
 */
function deleteRole(id) {
    return new Promise(async (resolve, reject) => {
        let result = await mongodb.Role.destroy({where: {id}});

        if (!result)
            return reject(
                new NotFoundError(Errors.MANAGER_NOT_FOUND.MESSAGE, Errors.MANAGER_NOT_FOUND.CODE, {id: id}),
            );

        return resolve("Successful");
    });
}

function getRoles(data) {
    return new Promise(async (resolve, reject) => {
        let {id, page, limit, order, name, nickName} = data;

        let result = {},
            query = {},
            offset = (page - 1) * limit;
        query.deletedAt = null
        if (id) query.id = id;

        // if (name) query.name = {[mongodb.Op.iLike]: "%" + name + "%"};
        //
        // if (nickName) query.nickName = {[mongodb.Op.iLike]: "%" + nickName + "%"};

        let count = await mongodb.Role.countDocuments({
            where: query,
        })
        result = await mongodb.Role.find({
            where: query,
        }).select("-__v")
            .sort({createdAt: "DESC"})
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        resolve({
            total: count ?? 0,
            pageSize: limit,
            page,
            data: result,
        });
    });
}

// Manager
/**
 * get Managers
 * @param {*} data
 * @returns
 */
function getManagers(data) {
    return new Promise(async (resolve, reject) => {
        let {id, page, limit, order, name, mobile, rule, email, status} = data;

        let result = {},
            query = {},
            offset = (page - 1) * limit;

        query.deletedAt = null;

        // if (id) query.id = id;
        // if (name) query.name = {[ mongodb.Op.iLike]: "%" + name + "%"};
        //
        // if (mobile) query.mobile = {[ mongodb.Op.iLike]: "%" + mobile + "%"};
        //
        // if (email) query.email = {[ mongodb.Op.iLike]: "%" + email + "%"};

        if (status) query.status = status;

        let count = await mongodb.Manager.countDocuments({
            where: query,
        })
        result = await mongodb.Manager.find({
            where: query,

        }).populate({path: 'roleId'})
            .select("-__v")
            .sort({createdAt: "DESC"})
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        resolve({
            total: count ?? 0,
            pageSize: limit,
            page,
            data: result,
        });
    });
}

/**
 * add new Managers
 * @param {*} data
 * @returns
 */
function addManagers(data, files) {
    return new Promise(async (resolve, reject) => {
        const existManager = await mongodb.Manager.findOne({email: data.email});
        if (existManager)
            return reject(new HumanError('manager with this email already exists', 400));

        let avatarData = {avatar: null};

        if (Object.keys(files).length) {
            for (let key in files) {
                let file = files[key].shift();

                avatarData[key] = [
                    {
                        name: file.newName,
                        key: file.key,
                        location: file.location,
                    },
                ];
            }
        }
        const getRole = await mongodb.Role.findOne({_id: data.roleId});
        //hash password if exist
        const _password = await password.generate(data.password);

        data.password = _password.hash;

        data.salt = _password.salt;


        let result = await mongodb.Manager.create({...data, ...avatarData});

        // await result.addRole(getRole);
        if (!result) return reject(new HumanError('Fail to add Manager', 400));

        return resolve("Successful");
    });
}

/**
 * edit Managers
 * @param {*} data
 * @returns
 */

function editManagers(data, files) {
    return new Promise(async (resolve, reject) => {
        let avatarData = {};
        if (Object.keys(files).length) {
            for (let key in files) {
                let file = files[key].shift();

                avatarData[key] = [
                    {
                        name: file.newName,
                        key: file.key,
                        location: file.location,
                    },
                ];
            }
        }

        //hash password if exist
        if (data.password) {
            const _password = await password.generate(data.password);

            data.password = _password.hash;

            data.salt = _password.salt;
        }
        let result = await mongodb.Manager.update({
                _id: data.id
            }, {
                $set: {
                    ...data,
                    ...avatarData,
                }
            },
        );

        if (!result)
            return reject(
                new NotFoundError(Errors.MANAGER_NOT_FOUND.MESSAGE, Errors.MANAGER_NOT_FOUND.CODE, {id: data.id}),
            );

        return resolve("Successful");
    });
}

/**
 * delete Managers
 */
function deleteManagers(id) {
    return new Promise(async (resolve, reject) => {
        let result = await mongodb.Manager.findOneAndUpdate({
            _id: id,
            deletedAt: null
        }, {$set: {deletedAt: new Date()}});

        if (!result)
            return reject(
                new NotFoundError(Errors.MANAGER_NOT_FOUND.MESSAGE, Errors.MANAGER_NOT_FOUND.CODE, {id: id}),
            );

        return resolve("Successful");
    });
}

/**
 * find Managers
 * @param {*} id
 * @returns
 */
function findManagerById(id) {
    return new Promise(async (resolve, reject) => {
        let result = await mongodb.Manager.findOne({_id: id}).select('-password -hash').populate({path: 'roleId'})

        if (!result)
            return reject(
                new NotFoundError(Errors.MANAGER_NOT_FOUND.MESSAGE, Errors.MANAGER_NOT_FOUND.CODE, {id: id}),
            );

        return resolve(result);
    });
}


module.exports = {
    findRoleById,
    addManagers,
    editManagers,
    getManagers,

    createRole,
    updateRole,
    deleteRole,
    getRoles,
    deleteManagers,
    findManagerById,
};

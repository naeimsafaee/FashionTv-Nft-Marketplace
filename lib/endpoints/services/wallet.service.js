// const configs = require("config");
// const {jwt, sms, mail, otpGenerator, password, request} = require("./../utils");
// const phone = require("phone");
// const em = require("exact-math");
// const {NotFoundError, HumanError, InvalidRequestError, ConflictError} = require("../services/errorhandler");
// const Errors = require("./errorhandler/MessageText");
// const axios = require("axios");
// const url = configs.get("clients.wallet.url");
// const hooks = require("../hooks");
// const {events, paymentStatus} = require("../data/constans");
// const {gatewayServices, walletChargeStripeGateway, walletChargeZarinpalGateway} = require("./gateway.service");
const {AssetNetwork, UserWallet, Asset} = require("../../databases/mongodb");

/**
 * Get user wallet Data and filter it by id, ...
 * @returns
 * @param data
 */
function getAll(data) {
    return new Promise(async (resolve, reject) => {
        let {id, assetId, userId, isLocked, order, page, limit, createdAt} = data;

        let offset = 0 + (page - 1) * limit,
            query = {};

        if (assetId)
            query.assetId = postgres.sequelize.where(
                postgres.sequelize.cast(postgres.sequelize.col("assetId"), "varchar"),
                {[postgres.Op.iLike]: `%${assetId}%`},
            );

        if (id) query.id = id;

        if (userId) query.userId = userId;

        if (typeof isLocked === "boolean") query.isLocked = isLocked;

        if (createdAt)
            query.createdAt = postgres.sequelize.where(
                postgres.sequelize.fn("date", postgres.sequelize.col("createdAt")),
                "=",
                createdAt,
            );

        let result = await postgres.UserWallet.findAndCountAll({
            where: query,
            offset,
            limit,
            order: [["createdAt", order]],
            nest: true,
            include: [
                {model: postgres.Asset, as: "asset"},
                {
                    model: postgres.User,
                    as: "user",
                    attributes: {exclude: ["password", "salt"]},
                },
            ],
            raw: true,
        });

        resolve({
            total: result.count,
            pageSize: limit,
            page,
            data: result.rows,
        });
    });
}

/**
 * Get one walelt
 * @returns
 * @param data
 */
function getOne(data) {
    return new Promise(async (resolve, reject) => {
        let {id, userId} = data;
        let result;
        try {
            result = await postgres.UserWallet.findOne({
                where: {
                    id,
                    ...(userId && {userId}),
                },
                nest: true,
                include: [
                    {model: postgres.Asset, as: "asset"},
                    {
                        model: postgres.User,
                        as: "user",
                        attributes: {exclude: ["password", "salt"]},
                    },
                ],
                raw: true,
            });
            console.log("result => ", result);
        } catch (e) {
            console.log("error => ", e);
        }

        if (!result) throw new NotFoundError(Errors.WALLET_NOT_FOUND.MESSAGE, Errors.WALLET_NOT_FOUND.CODE, {id});

        resolve(result);
    });
}

/**
 * get user wallet
 * @param {*} userId
 * @returns
 */
function getUserWallet(userId) {
    return new Promise(async (resolve, reject) => {
        const result = await postgres.UserWallet.findAll({
            where: {userId},
            nest: true,
            include: [
                {
                    model: postgres.Asset,
                    as: "asset",
                    where: {isActive: true},
                    attributes: {
                        exclude: ["canDeposit", "canWithdraw", "isActive", "createdAt", "updatedAt", "deletedAt"],
                    },
                },
            ],
            raw: true,
        });

        return resolve(result);
    });
}

/**
 * Verify exchange wallet connection
 * @param {*} token
 * @param {*} code
 */
async function verify(token, code) {
    let payload = jwt.verify(token);

    if (!payload)
        throw new NotFoundError(Errors.USER_NOT_FOUND_TOKEN.MESSAGE, Errors.USER_NOT_FOUND_TOKEN.CODE, {token});

    let form = await redis.client.get(`_user_${payload.type}_${payload.userId}`);

    form = JSON.parse(form);

    if (!form || +form.attempts > 3) {
        await redis.client.del(`_user_${payload.type}_${payload.userId}`);

        throw new NotFoundError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE, {user: null});
    }

    let check = false;

    switch (payload.type) {
        case "walletConnectMobile": {
            const smsCheck = await sms.check(form.mobile, code);
            if (smsCheck) check = true;
            break;
        }
        case "walletConnectEmail": {
            if (code == form.otpCode) check = true;
            break;
        }
        default: {
            check = false;
            break;
        }
    }

    if (!check) {
        form.attempts++;

        await redis.client.set(`_user_${payload.type}_${payload.userId}`, JSON.stringify(form), "EX", 600);

        throw new InvalidRequestError(Errors.USER_TOKEN_VERIFY.MESSAGE, Errors.USER_TOKEN_VERIFY.CODE);
    }

    // remove verify cache
    await redis.client.del(`_user_${payload.type}_${payload.userId}`);

    // update user exchange id
    await postgres.User.update({userExchangeId: +form.userExchangeId}, {where: {id: +payload.userId}});

    // set connection to wallet status in cache
    await redis.client.set(
        `_user_walletConnected_${payload.userId}`,
        JSON.stringify({connected: true, userExchangeId: form.userExchangeId, userId: payload.userId}),
    );

    return "Successful";
}

/**
 * Get all coin and token fee for deposit or withdraw
 */
function config(data, userId) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, order, sort, type, coin, createdAt, searchQuery} = data;

        let query = {
            deletedAt: null,
            isActive: true,
        };

        if (coin) {
            query = {"asset.coin": new RegExp(coin, "i")};
        }

        if (searchQuery) {
            query["$or"] = [
                {
                    "asset.coin": {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
            ];
        }
        if (type === "deposit") query.canDeposit = true;

        if (type === "withdraw") query.canWithdraw = true;

        let sortObject = {[sort]: order === "DESC" ? -1 : 1};
        const result = await AssetNetwork.aggregate([
            {
                $lookup: {
                    from: "assets",
                    localField: "assetId",
                    foreignField: "_id",
                    as: "asset",
                },
            },
            {
                $lookup: {
                    from: "networks",
                    localField: "networkId",
                    foreignField: "_id",
                    as: "networkId",
                },
            },
            {
                $addFields: {
                    assetId: "$assetId",
                },
            },
            {$match: query},
            {$sort: sortObject},
            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}],
                },
            },
        ]).collation({locale: "en"});

        const items = result[0].data;
        const metadata = result[0].metadata[0];

        const output = await Promise.all(
            items.map(async (item) => {
                const wallet = await UserWallet.findOne({assetId: item.assetId, userId: userId}).lean();

                return {
                    wallet: wallet,
                    id: item._id,
                    protocolType: item.networkId.map((table) => table.type).join("،"),
                    network: item.networkId.map((table) => table.name).join("،"),
                    hasTag: item.asset.map((table) => table.hasTag).join("،"),
                    ...(type == "deposit"
                        ? {depositFee: item.depositFee, depositMin: item.depositMin}
                        : {withdrawFee: item.withdrawFee, withdrawMin: item.withdrawMin}),
                };
            }),
        );

        resolve({
            total: metadata?.total ?? 0,
            pageSize: limit,
            page: metadata?.page ?? page,
            data: output,
        });

        // const assetNetworks = await AssetNetwork.find({
        // 	where: {
        // 		"$asset.coin$": coin,
        // 		isActive: true,
        // 		...(type == "deposit" ? { canDeposit: true } : type == "withdraw" ? { canWithdraw: true } : {}),
        // 	},
        // 	include: [
        // 		{
        // 			model: postgres.Asset,
        // 			as: "asset",
        // 			nested: true,
        // 		},
        // 		{
        // 			model: postgres.Network,
        // 			as: "network",
        // 			nested: true,
        // 		},
        // 	],
        // });

        // if (!assetNetworks.length) return reject(new HumanError("We do not have any network for this asset", 400));

        // const wallet = await postgres.UserWallet.findOne({
        // 	where: {
        // 		assetId: assetNetworks[0].assetId,
        // 		userId,
        // 	},
        // 	attributes: ["amount", "frozen", "pending"],
        // });

        // return resolve(
        // 	assetNetworks.map((assetNetwork) => ({
        // 		wallet,
        // 		id: assetNetwork.id,
        // 		network: assetNetwork.network.name,
        // 		protocolType: assetNetwork.network.type,
        // 		hasTag: assetNetwork.asset.hasTag,
        // 		...(type == "deposit"
        // 			? { depositFee: assetNetwork.depositFee, depositMin: assetNetwork.depositMin }
        // 			: { withdrawFee: assetNetwork.withdrawFee, withdrawMin: assetNetwork.withdrawMin }),
        // 	})),
        // );
    });
}

/**
 * Get active asset for withdraw or deposit
 */
function list(type) {
    return new Promise(async (resolve, reject) => {

        let result;
        if (type === "deposit")
            result = await Asset.find({canDeposit: true, isActive: true, deletedAt: null});

        if (type === "withdraw")
            result = await Asset.find({canWithdraw: true, isActive: true, deletedAt: null});


        resolve(result);
    });
}

function getDepositAddress(data) {
    return new Promise(async (resolve, reject) => {
        const {assetNetworkId, userId} = data;
        const assetNetwork = await postgres.AssetNetwork.findOne({
            where: {id: assetNetworkId, isActive: true, canDeposit: true},
            raw: true,
            include: [
                {model: postgres.Asset, as: "asset"},
                {model: postgres.Network, as: "network"},
            ],
        });

        if (!assetNetwork)
            return reject(
                new NotFoundError(Errors.ASSET_NETWORK_NOT_FOUND.MESSAGE, Errors.ASSET_NETWORK_NOT_FOUND.CODE),
            );

        const callUrl = `${url}/api/v1/wallet/address?currency=${assetNetwork?.apiCode}&userId=${userId}&clientId=1`;

        axios
            .get(callUrl, {
                headers: {
                    "x-api-key": require("config").get("clients.wallet.apiKey"),
                },
            })
            .then((res) => {
                if (res?.data?.status == "success") return resolve(res?.data?.data);

                reject(
                    new HumanError(
                        Errors.ADDRESS_GENERATION_FAILED.MESSAGE,
                        Errors.ADDRESS_GENERATION_FAILED.CODE,
                        res?.data,
                    ),
                );
            })
            .catch((err) => {
                reject(
                    new HumanError(
                        Errors.ADDRESS_GENERATION_FAILED.MESSAGE,
                        Errors.ADDRESS_GENERATION_FAILED.CODE,
                        err?.response?.data?.error,
                    ),
                );
            });
    });
}

async function editAmountWallet(amount, userId) {
    return new Promise(async (resolve, reject) => {
        let result = await postgres.UserWallet.update({amount}, {where: {userId}});

        if (!result.shift())
            return reject(
                new NotFoundError(Errors.USER_NOT_FOUND.MESSAGE, Errors.USER_NOT_FOUND.CODE, {userId: userId}),
            );

        return resolve("Successful");
    });
}

/**
 *
 * @returns NodeJs.Timer
 * @description Run this function after all pre-load server requirements
 */
async function listenForDepositResults(channel, app) {
    const io = app.get("socketIo");

    dequeue("incomingTransactions", handleDeposit, channel, io);
}

/**
 *
 * @returns NodeJs.Timer
 * @description Run this function after all pre-load server requirements
 */
async function listenForWithdrawResults(channel, app) {
    const io = app.get("socketIo");

    dequeue("outgoingTransactions", handleWithdraw, channel, io);
}

/**
 *
 * @returns NodeJs.Timer
 * @description After adding a new currency to the system, this function creates a new wallet for existing users
 */
async function listenForCreateWallet(channel, app) {
    const io = app.get("socketIo");

    dequeue("createWalletForUsers", handleCreateWalletForUser, channel, io);
}

/**
 *
 * @param {*} queue
 * @param {*} dispatch
 * @param {*} channel
 */
async function dequeue(queue, dispatch, channel, io) {
    await channel.assertQueue(queue);

    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            try {
                const data = JSON.parse(msg.content.toString());

                await dispatch(data, io);

                channel.ack(msg);
            } catch (e) {
                console.log(e);

                channel.nack(msg);
            }
        }
    });
}

/**
 * handel user deposit
 * 1). calculate final amount by minus deposit fee from amount
 * 2). increment system wallet if deposit fee > 0
 * 3). update user wallet by final amount if > 0
 * 4). create new user transaction
 */
async function handleDeposit(data, io) {
    // return new Promise(async (resolve, reject) => {
    let transaction;

    try {
        transaction = await postgres.sequelize.transaction();

        let {
            from,
            address: {userId},
            currency,
            amount,
            txId,
            date,
        } = data;

        let assetNetwork = await postgres.AssetNetwork.findOne({where: {apiCode: currency}});

        if (!assetNetwork) {
            // Save the wrong transaction for future
            await postgres.UserErrorTransaction.create({userId, currency, amount, date, information: data});

            await transaction.commit();
            return true;
        }

        const getUserWalletForPbalance = await postgres.UserWallet.findOne({
            where: {
                assetId: assetNetwork?.assetId,
                userId: userId,
            },
            raw: true,
        });

        let fee = +assetNetwork.depositFee;

        //let finalAmount = em.sub(+amount, fee);

        let systemProfit = 0;
        if (fee > 0) {
            systemProfit = (+amount * fee) / 100;
        }
        let finalAmount = +amount - systemProfit;

        if (fee > 0) await handleSystemWallet(transaction, fee, assetNetwork?.assetId);

        if (finalAmount > 0) await handleUserWallet(transaction, finalAmount, assetNetwork?.assetId, userId, io);

        let userTransaction = await postgres.UserTransaction.create(
            {
                userId,
                previousBalance: +getUserWalletForPbalance?.amount || 0,
                type: "DEPOSIT",
                assetId: assetNetwork.assetId,
                assetNetworkId: assetNetwork.id,
                address: from,
                amount,
                depositFee: fee,
                status: "DONE",
                txid: txId,
                origin: "SYSTEM",
                profit: systemProfit,
            },
            {transaction, returning: true},
        );
        const user = await postgres.User.findOne({where: {id: userId}, raw: true});

        // send notification to admin
        let title = `User ${user?.name || user?.email || userId} is deposit ${amount} ${currency} successfully.`;
        let notif = await postgres.ManagerNotification.create({title, userId, tag: "Deposit"});
        io.to(`Manager`).emit("notification", JSON.stringify(notif));

        await transaction.commit();

        hooks.trigger([events.deposit.add, events.income.add], "after", userTransaction);

        return true;
    } catch (err) {
        console.log("err handleDeposit: ", err);
        if (transaction) await transaction.rollback();

        throw err;
    }
    // });
}

/**
 * increment system wallet by asset id
 * if for this asset id wallet not exist, create new wallet with new amount
 * @param {*} transaction
 * @param {*} fee
 * @param {*} assetId
 * @returns
 */
function handleSystemWallet(transaction, fee, assetId) {
    return new Promise(async (resolve, reject) => {
        let isExist = await postgres.SystemWallet.increment("amount", {
            by: fee,
            where: {assetId},
            transaction,
        });

        if (!isExist?.shift()?.[1]) await postgres.SystemWallet.create({assetId, amount: fee}, {transaction});

        resolve(true);
    });
}

/**
 * increment user wallet by asset id
 * if for this asset id wallet not exist, create new wallet with new amount
 * @param {*} transaction
 * @param {*} amount
 * @param {*} assetId
 * @param {*} userId
 * @returns
 */
function handleUserWallet(transaction, amount, assetId, userId, io) {
    return new Promise(async (resolve, reject) => {
        let isExist = await postgres.UserWallet.increment("amount", {
            by: amount,
            where: {assetId, userId},
            transaction,
        });

        let newWallet;
        if (!isExist?.[0]?.[1])
            newWallet = await postgres.UserWallet.create({assetId, amount, userId}, {transaction});

        // send update user wallet from socket
        io.to(`UserId:${userId}`).emit("wallet", JSON.stringify(isExist?.[0]?.[0] || [newWallet]));

        resolve(true);
    });
}

/**
 * handel user withdraw
 * 1). calculate final amount by plus deposit fee
 * 2). decrement final amount from user wallet pending
 * 3). increment system wallet if withdraw fee > 0
 * 4). update user transaction
 * @param {*} data
 * @returns
 */
function handleWithdraw(data, io) {
    return new Promise(async (resolve, reject) => {
        let transaction;
        try {
            transaction = await postgres.sequelize.transaction();

            let {paymentId, txId} = data;

            let userTransaction = await postgres.UserTransaction.findOne({
                where: {id: paymentId, status: "PENDING"},
                include: [
                    {
                        model: postgres.AssetNetwork,
                        as: "assetNetworks",
                        required: true,
                    },
                ],
            });
            if (!userTransaction || !userTransaction.assetNetworks) {
                await transaction.rollback();
                return resolve();
            }

            const getUserWalletForPbalance = await postgres.UserWallet.findOne({
                where: {
                    assetId: userTransaction?.assetNetworks?.assetId,
                    userId: userTransaction?.userId,
                },
                raw: true,
            });

            if (!userTransaction) {
                await transaction.rollback();
                return reject(
                    new NotFoundError(
                        Errors.WALLET_USER_TRANSACTION_NOT_FOUND.MESSAGE,
                        Errors.WALLET_USER_TRANSACTION_NOT_FOUND.CODE,
                    ),
                );
            }

            let finalAmount = em.add(+userTransaction.amount, +userTransaction.withdrawFee);

            if (userTransaction.info != "FEE")
                await postgres.UserWallet.decrement("pending", {
                    by: finalAmount,
                    where: {
                        assetId: userTransaction?.assetNetworks?.assetId,
                        userId: userTransaction?.userId,
                    },
                    transaction,
                });

            if (+userTransaction.withdrawFee > 0)
                await handleSystemWallet(
                    transaction,
                    +userTransaction.withdrawFee,
                    userTransaction?.assetNetworks?.assetId,
                );

            userTransaction.previousBalance = +getUserWalletForPbalance?.amount;
            userTransaction.status = "DONE";

            await userTransaction.save({transaction});

            if (userTransaction.info != "FEE") {
                const user = await postgres.User.findOne({where: {id: userTransaction?.userId}, raw: true});
                // send notification to admin
                let title = `User ${user?.name || user?.email || user?.id} is withdraw ${userTransaction.amount} ${
                    userTransaction?.assetNetworks?.apiCode
                } successfully.`;
                let notif = await postgres.ManagerNotification.create({
                    title,
                    userId: userTransaction?.userId,
                    tag: "Withdraw",
                });
                io.to(`Manager`).emit("notification", JSON.stringify(notif));
            }

            await transaction.commit();

            hooks.trigger([events.withdraw.completed, events.income.add], "after", userTransaction);

            resolve(true);
        } catch (err) {
            if (transaction) await transaction.rollback();

            reject(err);
        }
    });
}

/**
 *
 * @param {object} body object
 * @param {string} body.clientId === 1
 * @param {string} body.currency Currency name
 * @param {number} body.paymentId transactionId in Exchange service
 * @param {number} body.amount Withdraw amount; Must be lower than user wallet ballace
 * @param {number} body.fee for networks bitcoin | litecoin | dogecoin | bitcoin-cach | ada | tron
 * @param {number} body.gasPrice for networks ethereum | bsc | matic; In these networks fee has 2 parameters: gasPrice & gasLimit
 * @param {number} body.gasLimit for networks ethereum | bsc | matic
 * @param {string} body.address withdraw address
 * @param {string} body.tag for some addresses in tron & bitcoin networks is required
 * @example  {
		"currency": "BTC", //? Coin name
		"paymentId": 2, //? Transaction ID
		"amount": 0.00005800, //? Withdraw amount; Must be lower than user wallet ballace
		"fee": 0.00005000, //? for networks bitcoin | litecoin | dogecoin | bitcoin-cach | ada | tron
		"gasPrice": 0, //? for networks ethereum | bsc | matic; In these networks fee has 2 parameters: gasPrice & gasLimit
		"gasLimit": 0, //? for networks ethereum | bsc | matic
		"address": "14kZEMupct2b43jmQYCH4kcc78K1E6YQ6W", //? withdraw address
		"tag": "", //? for some addresses in tron & bitcoin networks is required
		"type": "",
		"network": ""
	}
 * @returns {object} created transaction in wallet service
 */
function postWithdrawRequest(body) {
    return new Promise(async (resolve, reject) => {
        const callUrl = `${url}/api/v1/wallet/withdraw`;
        axios
            .post(callUrl, body, {
                headers: {
                    "x-api-key": require("config").get("clients.wallet.apiKey"),
                },
            })
            .then((res) => {
                if (res?.data?.status == "success") return resolve(res?.data?.data);
                //? created transaction data on wallet service
                else reject(res?.data);
            })
            .catch((err) => {
                return reject(
                    new InvalidRequestError(
                        Errors.WALLET_WITHDRAW_ERROR.MESSAGE + err?.response?.data?.error,
                        Errors.WALLET_WITHDRAW_ERROR.CODE,
                    ),
                );
            });
    });
}

exports.chargeWalletFinal = (payment) => {
    return new Promise(async (resolve, reject) => {
        try {
            await payment.update({status: paymentStatus.successful});
        } catch (e) {
            console.log(e);
            await transaction.rollback();
        }
        let userWallet = await postgres.UserWallet.findOne({
            where: {userId: payment.userId, assetId: payment.assetId},
        });
        if (!userWallet)
            userWallet = await postgres.UserWallet.create({userId: payment.userId, assetId: payment.assetId});

        const transaction = await postgres.sequelize.transaction();

        try {
            const previousBalance = userWallet.amount;
            await userWallet.increment("amount", {by: +payment.amount, transaction});
            await new postgres.UserTransaction({
                userId: payment.userId,
                type: "DEPOSIT",
                amount: payment.amount,
                previousBalance,
                assetId: null,
                status: "DONE",
            }).save();
            transaction.commit();
        } catch (e) {
            console.log(e);
            await transaction.rollback();
        }
    });
};

function editSystemWallet(data) {
    return new Promise(async (resolve, reject) => {
        const {id, amount} = data;

        const currentWallet = await postgres.SystemWallet.findByPk(id);
        if (!currentWallet) {
            return reject(new NotFoundError(Errors.WALLET_NOT_FOUND.MESSAGE, Errors.WALLET_NOT_FOUND.CODE, {id}));
        }

        const update = {};

        if (amount) update.amount = +amount;

        const updatedWallet = await currentWallet.update(update);

        if (!updatedWallet) {
            return reject(new InternalError(Errors.UPDATE_FAILED.MESSAGE, Errors.UPDATE_FAILED.CODE));
        }

        return resolve("Success");
    });
}

function getSystemWallet(data) {
    return new Promise(async (resolve, reject) => {
        const {id} = data;

        const wallet = await postgres.SystemWallet.findByPk(id);
        if (!wallet) {
            return reject(new NotFoundError(Errors.WALLET_NOT_FOUND.MESSAGE, Errors.WALLET_NOT_FOUND.CODE, {id}));
        }

        return resolve(wallet);
    });
}

function getSystemWallets(data) {
    return new Promise(async (resolve, reject) => {
        const {page, limit, sort, order, search} = data;

        const query = {};

        const offset = (page - 1) * limit;

        if (search) {
            query[postgres.Op.or] = [
                {
                    amount: postgres.sequelize.where(
                        postgres.sequelize.cast(postgres.sequelize.col("amount"), "varchar"),
                        {
                            [postgres.Op.iLike]: `%${search}%`,
                        },
                    ),
                },
                {
                    "$asset.coin$": {[postgres.Op.iLike]: `%${search}%`},
                },
                {
                    "$asset.name$": {[postgres.Op.iLike]: `%${search}%`},
                },
            ];
        }

        const items = await postgres.SystemWallet.findAndCountAll({
            where: query,
            limit,
            offset,
            order: [[sort, order]],
            include: {model: postgres.Asset, as: "asset"},
        });

        resolve({
            total: items.count,
            pageSize: limit,
            page,
            data: items.rows,
        });
        return resolve(items);
    });
}

async function handleCreateWalletForUser(data, io) {
    return new Promise(async (resolve, reject) => {
        const {currency, assetId} = data;
        try {
            const q = await postgres.sequelize.query(
                `SELECT id FROM "users" WHERE NOT EXISTS(SELECT 1 FROM "userWallets" WHERE "userId"=users.id AND "assetId"=${assetId})`,
                {
                    type: QueryTypes.SELECT,
                },
            );

            if (q.length == 0) {
                return resolve(true);
            }

            q.forEach(async (item) => {
                const create = await createAddressAndWalletForUser(item.id, assetId, currency);
                if (!create) {
                    return resolve(false);
                }
            });

            resolve(true);
        } catch (error) {
            console.log("*** createUsersWallet error:", error);
            return resolve(false);
        }
    });
}

async function createAddressAndWalletForUser(userId, assetId, currency) {
    return new Promise(async (resolve, reject) => {
        const baseUrl = configs.get("clients.wallet.url");
        const path = `/api/v1/wallet/address?currency=${currency}&userId=${userId}&clientId=1`;
        const apiKey = configs.get("clients.wallet.apiKey");
        /*
        const result = await axios.get(`${baseUrl}${path}`, {
            headers: {
                "Content-Type": "Application/json",
                Accept: "application/json",
                "X-API-KEY": apiKey,
            },
        });
        if (result.status != 200) {
            resolve(false);
        }*/

        const uw = await postgres.UserWallet.create({userId, assetId});
        if (uw) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
}

module.exports = {
    getAll,
    getOne,
    verify,
    config,
    list,
    getDepositAddress,
    getUserWallet,
    editAmountWallet,
    listenForDepositResults,
    listenForWithdrawResults,
    postWithdrawRequest,
    editSystemWallet,
    getSystemWallet,
    getSystemWallets,
    listenForCreateWallet,
};

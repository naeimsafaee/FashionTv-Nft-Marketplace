const {dateQueryBuilder} = require("../../utils/dateQueryBuilder");
const {Asset, UserTransaction, AssetNetwork, UserWallet} = require("../../databases/mongodb");
const {NotFoundError, HumanError} = require("./errorhandler");
const {ethers, utils, BigNumber} = require("ethers");
const em = require("exact-math");
const Web3Token = require("web3-token");


/**
 * get assets list
 */
function getAssets(data) {
    return new Promise(async (resolve, reject) => {
        const {limit, page, name, type, address, searchQuery} = data;
        let query = {};
        query.deletedAt = null;

        if (name) {
            query.name = new RegExp(name, "i");
        }
        if (address) {
            query.address = new RegExp(address, "i");
        }

        if (type) {
            query.type = {$in: [...type]};
        }

        if (searchQuery) {
            query.$or = [
                {
                    name: {$regex: searchQuery || "", $options: "i"},
                },
                {
                    address: {$regex: searchQuery || "", $options: "i"},
                },
                {
                    type: {$regex: searchQuery || "", $options: "i"},
                },
            ];
        }

        const count = await Asset.countDocuments(query);
        let result = await Asset.find(query)
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

function getAssetSingle(id) {
    return new Promise(async (resolve, reject) => {
        const asset = await Asset.findOne({_id: id, deletedAt: null});
        if (!asset) return reject(new NotFoundError("asset not found", 400));

        return resolve(asset);
    });
}

/**
 * get user transaction list
 * @param {*} data
 * @returns
 */
async function readTransactions(data) {
    const {
        page,
        limit,
        order,
        type,
        assetNetworkId,
        address,
        tag,
        status,
        txid,
        info,
        account,
        assetId,
        index,
        id,
        userId,
    } = data;
    const offset = 0 + (page - 1) * limit;

    const query = {
        // ...(type ? {type} : {}),
        // ...(assetNetworkId ? {assetNetworkId} : {}),
        // ...(address ? {address} : {}),
        // ...(tag ? {tag} : {}),
        // ...(status ? {status} : {}),
        // ...(txid ? {txid} : {}),
        // ...(info ? {info} : {}),
        // ...(account ? {account} : {}),
        // ...(assetId ? {assetId} : {}),
        // ...(index ? {index} : {}),
        // ...(id ? {id} : {}),
        userId,
    };

    let count = await UserTransaction.countDocuments({query, userId: userId, deletedAt: null});
    let result = await UserTransaction.find({query, userId: userId, deletedAt: null})
        .sort({createdAt: "DESC"})
        .populate({path: "assetId"})
        .populate({path: "assetNetworkId", populate: {path: "assetId", path: "networkId"}})
        .skip((page - 1) * limit)
        .limit(limit);
    return {
        total: count ?? 0,
        pageSize: limit,
        page,
        data: result,
    };
}

/**
 * confirm user withdraw request and save it in db
 */
async function confirmWithdraw({token, code}, userEntity, io) {
    const payload = jwt.verify(token);

    if (!payload) throw new HumanError("The code is incorrect", 400, {token});

    let form = await redis.client.get(`_confirm_withdraw_user_${userEntity.id}_`);

    form = JSON.parse(form);

    if (!form) throw new HumanError("There is no user with the details entered in the system", 400);

    let check = false;
    switch (payload.type) {
        case "mobile": {
            const smsCheck = await sms.check(userEntity.mobile, code);
            if (smsCheck) check = true;
            break;
        }
        case "email": {
            if (code == form.otpCode) check = true;
            break;
        }
        default: {
            check = false;
            break;
        }
    }

    if (!check) throw new HumanError("An error occurred while validating the token", 400);

    let {userId, assetId, totalAmount} = form;

    //check user wallet for this asset is exist
    let wallet = await UserWallet.findOne({where: {userId, assetId}});

    if (!wallet) throw new HumanError("User Wallet not found", 400);

    if (totalAmount > +wallet.amount) throw new HumanError("The requested amount is more than the users balance", 400);

    //save new balance in wallet
    wallet.amount = em.sub(+wallet.amount, totalAmount);
    wallet.pending = em.add(+wallet.pending, totalAmount);
    await wallet.save();

    const transaction = await postgres.UserTransaction.create(form);

    if (!transaction) throw new HumanError("An error occurred while registering the transaction", 400);

    const asset = await postgres.Asset.findOne({where: {id: assetId}});

    /*const busd = await postgres.Asset.findOne({ where: { coin: "BUSD" } });
    if (busd && asset) {

        let amountForHeat = totalAmount;
        if (busd.id !== asset.id) {

            let fromToken;
            if (asset.coin === "BNB") {
                fromToken = "BNB";
            } else {
                fromToken = asset.coin + "_BSC";
            }

            try {

                const result = await price({
                    fromToken: fromToken,
                    toToken: "BUSD_BSC",
                    slippage: 1,
                    balanceIn: totalAmount,
                    origin: "in"
                });

                amountForHeat = result.price;
            } catch (e) {
                console.log(e)
            }

        }

        await applyHeat(userId, amountForHeat, assetId);

    }*/

    await redis.client.del(`_confirm_withdraw_user_${userEntity.id}_`);

    let title = `User ${
        userEntity.name ? (userEntity.email ? userEntity.email : userEntity.mobile) : null
    }  Successfully registered a new withdraw`;
    let notif = await postgres.ManagerNotification.create({title, userId, tag: "TRANSACTION"});
    io.to(`Manager`).emit("notification", JSON.stringify(notif));

    return "Successful";
}

async function withdrawRequest(data, userId, io) {
    let {id, address, amount, tag, from_agent_panel, signer} = data;

    const max_withdraw_per_day = 50
    /*const userHasGhostCard = await checkUserHasGhostCard(user.id);
    if (userHasGhostCard)
        throw new HumanError("You need to buy a camera to withdraw", 400);*/

    // const isAddressCorrect = await checkAddress(address, signer);
    // if (!isAddressCorrect) throw new HumanError("Your Address wallet is not same with your signer", 400);

    let assetNetwork = await AssetNetwork.findOne({_id: id, isActive: true, canWithdraw: true});

    if (!assetNetwork) throw new HumanError("Asset Network not found", 400);

    let asset = await Asset.findOne({_id: assetNetwork.assetId, isActive: true, canWithdraw: true});

    if (!asset) throw new HumanError("Asset not found", 400);

    // set max withdraw for bnb
    if (asset.coin === "BNB") {
        const TODAY_START = new Date().setHours(0, 0, 0, 0);
        const NOW = new Date();

        let user_txs = await UserTransaction.find({
            type: "WITHDRAW",
            status: {$ne: "REJECTED"},
            assetId: asset._id,
            userId,
            createdAt: {$gte: TODAY_START, $lte: NOW},
        });

        let total_amount = 0;
        user_txs.forEach(function (tx) {
            total_amount += parseInt(tx.amount);
        });

        if (+total_amount + +amount > max_withdraw_per_day)
            throw new HumanError("Maximum allowed withdraw per day is: " + max_withdraw_per_day, 400);
    }

    // check user is agent for withdraw from agent panel
    // if (level !== "AGENT") from_agent_panel = false;

    let {withdrawFee, depositFee, fee, gasPrice, gasLimit, assetId, withdrawMin} = assetNetwork;

    // check minimum value for withdraw
    if (amount < +withdrawMin) throw new HumanError("Minimum allowed for withdraw: " + withdrawMin, 400);

    let systemProfit = 0;
    if (+withdrawFee > 0) {
        systemProfit = (+amount * +withdrawFee) / 100;
    }

    //calculate all transfer costs
    let totalAmount = em.add(+amount, +systemProfit);

    //check user wallet for this asset is exist

    let wallet = await UserWallet.findOne({userId, assetId});

    if (!wallet) throw new NotFoundError("User Wallet not found", 400);

    if (totalAmount > +wallet.amount) throw new HumanError("The requested amount is more than the users balance", 400);


    wallet.amount = em.sub(+wallet.amount, totalAmount);
    wallet.pending = em.add(+wallet.pending, totalAmount);
    await wallet.save();

    const transaction = await UserTransaction.create({
        type: "WITHDRAW",
        assetNetworkId: id,
        userId,
        address,
        tag,
        status: 'AUDITING',
        amount: +amount,
        withdrawFee: +withdrawFee,
        depositFee: +depositFee,
        fee: +fee,
        gasPrice: +gasPrice,
        gasLimit: +gasLimit,
        // otpCode,
        totalAmount,
        assetId,
        from_agent_panel,
        origin: "ADMIN",
        profit: systemProfit,
    })
    if (!transaction) throw new HumanError("An error occurred while registering the transaction", 400);

    return 'your withdraw request submitted successfully';
}

async function checkAddress(address, signer) {

    // const verifyResult = await Web3Token.verify(signer);
    // const address1 = verifyResult.address;

    const recoveredAddress = ethers.utils.verifyMessage("Please sign your wallet", signer);

    if (recoveredAddress !== address) return false;

    // if (address1 !== address) return false;

    return true;
}

module.exports = {
    getAssets,
    getAssetSingle,
    readTransactions,
    confirmWithdraw,
    withdrawRequest,
};

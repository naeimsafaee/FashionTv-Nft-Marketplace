const {NotFoundError, HumanError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {UserTransaction, Asset, UserWallet} = require("../../databases/mongodb");
const ObjectId = require("mongoose").Types.ObjectId;
const erc20Token = require("./erc20Token");

const exactMath = require("exact-math");

function getAllTransactionByManager(data) {
    return new Promise(async (resolve, reject) => {
        const {
            index,
            profit,
            amount,
            page,
            limit,
            order,
            sort,
            coin,
            previousBalance,
            searchQuery,
            createdAt,
            username,
            type,
        } = data;
        let query = {deletedAt: null};
        query.deletedAt = null;
        // if (id) query._id = mongoose.Types.ObjectId(id);
        if (previousBalance) query.previousBalance = previousBalance;
        if (amount) query.amount = amount;
        if (profit) query.profit = profit;
        if (index) query.index = index;
        if (type) query.type = {$in: [...type]};

        if (username) {
            query = {"userId.username": new RegExp(username, "i")};
        }

        if (coin) {
            query = {"assetId.coin": new RegExp(coin, "i")};
        }

        if (createdAt) {
            const {start, end} = dateQueryBuilder(createdAt);
            query.createdAt = {$gte: start, $lte: end};
        }
        if (searchQuery) {
            query["$or"] = [
                {
                    "assetId.coin": {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    "userId.username": {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    amount: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    index: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    profit: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
            ];
        }

        let sortObject = {[sort]: order === "DESC" ? -1 : 1};
        if (sort === "amount") {
            sortObject = {["amount"]: order === "DESC" ? -1 : 1};
        }

        const result = await UserTransaction.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                },
            },
            {$unwind: {path: "$userId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "assetNetworks",
                    localField: "assetNetworkId",
                    foreignField: "_id",
                    as: "assetNetworkId",
                },
            },
            {$unwind: {path: "$assetNetworkId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "assets",
                    localField: "assetId",
                    foreignField: "_id",
                    as: "assetId",
                },
            },
            {$unwind: {path: "$assetId", preserveNullAndEmptyArrays: true}},
            {$sort: sortObject},
            {$match: query},
            {
                $facet: {
                    metadata: [{$count: "total"}, {$addFields: {page}}],
                    data: [{$skip: (page - 1) * limit}, {$limit: limit}],
                },
            },
        ]).collation({locale: "en"});

        const items = result[0].data;
        const metadata = result[0].metadata[0];

        resolve({
            total: metadata?.total ?? 0,
            pageSize: limit,
            page: metadata?.page ?? page,
            data: items,
        });
    });
}

function updateTransactionByManager(data) {
    return new Promise(async (resolve, reject) => {
        const {id, status} = data;
        let result = await UserTransaction.findOne({_id: id});
        result.status = status;
        await result.save();

        if (!result)
            return reject(
                new NotFoundError(Errors.TRANSACTION_NOT_FOUND.MESSAGE, Errors.TRANSACTION_NOT_FOUND.CODE, {id}),
            );

        const asset = await Asset.findOne({_id: result.assetId});
        if (status === "pending") {
            try {
                const {txId} = await transferCrypto({
                    amount: result.amount,
                    to: result.address,
                    contractAddress: asset.address,
                });
                //successful with tx_id
                result.status = "DONE";
                result.txId = txid;
                await result.save();
            } catch (e) {
                const userWallet = await UserWallet.findOne({
                    userId: UserTransaction.userId,
                    assetId: UserTransaction.assetId,
                });
                if (!userWallet) return reject(new NotFoundError("user wallet not found ", 400));
                userWallet.pending = userWallet.pending - result.amount;
                userWallet.amount = userWallet.amount + result.amount;
                await userWallet.save();

                result.status = "rejected";
                await result.save();
                return reject(new HumanError("Transaction failed! ", 400));
            }
        }

        return resolve("Successful");
    });
}

async function transferCrypto(data) {
    try {
        const testnet = false;

        let from, fromPrivateKey;

        // if (!data.index) {
        fromPrivateKey = process.env["SYSTEM_WALLET_SECRET_KEY"];

        from = process.env["SYSTEM_WALLET_ADDRESS"];
        /*} else {
            let currency = toBaseCurrency("BSC"),
                mnemonic = process.env["TATUM_BSC_MNEMONIC"];

            const wallet = await tatum.generateWallet(currency, testnet, mnemonic);

            from = await tatum.generateAddressFromXPub(
                currency,
                testnet,
                wallet.xpub,
                data.index
            );

            fromPrivateKey = await tatum.generatePrivateKeyFromMnemonic(
                currency,
                testnet,
                mnemonic,
                data.index
            );
        }*/

        return {
            txId: await erc20Token.transfer({
                chain: "BSC",
                contractAddress: data.contractAddress,
                fromPrivateKey,
                from,
                amount: data.amount,
                testnet,
                to: data.to,
            }),
        };
    } catch (e) {
        console.log(e);

        throw Error(e?.message ? "SERVICE_UNAVAILABLE|" + e.message : "CONFLICT|nft trasnfer failed");
    }
}

async function getById(id) {
    let result = await UserTransaction.findOne({
        _id: id
    }).populate({path: 'userId', select: '-password -salt'})
        .populate({path: 'assetNetworkId', populate: [{path: 'assetId'}, {path: 'networkId'}]})


    if (!result)
        return (
            new NotFoundError(Errors.TRANSACTION_NOT_FOUND.MESSAGE, Errors.TRANSACTION_NOT_FOUND.CODE, {id})
        );

    return (result);
}


module.exports = {
    getAllTransactionByManager,
    updateTransactionByManager,
    transferCrypto,
    getById
};

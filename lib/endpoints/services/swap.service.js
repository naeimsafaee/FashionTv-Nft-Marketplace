const {Asset, UserWallet, Setting, SwapTransaction} = require("../../databases/mongodb");
const {HumanError} = require("../services/errorhandler");
const {JsonRpcProvider} = require("@ethersproject/providers");
const {ethers, Wallet} = require("ethers");
const Web3 = require("web3");
const swapRouter = require("../../data/router");
const {getAmountsOut} = require("../../utils/liquidity");
const config = require("config");
const mongoose = require("mongoose");
const moment = require("moment");

exports.index = async (data, user) => {
    //I need userId here

    // const cardTypeSwap = await postgres.Card.findAll({
    //     include: [
    //         {
    //             model: postgres.CardType,
    //             where: { name: { [postgres.Op.ne]: "Ghost" } },
    //             required: true
    //         },
    //         {
    //             model: postgres.AssignedCard,
    //             where: { userId: req.userEntity.id },
    //             required: true
    //         }
    //     ]
    // });

    let amount = 0;

    // for (let i = 0; i < cardTypeSwap.length; i++) {
    //     const cardTypee = await postgres.CardType.findOne({ where: { id: cardTypeSwap[i].cardTypeId } });
    //
    //     const userCameraLevel = await postgres.UserAttribute.findOne({
    //         where: {
    //             userId: req.userEntity.id,
    //             cardId: cardTypeSwap[i].id
    //         },
    //         include: [{
    //             model: postgres.Attribute,
    //             where: {name: "LEVEL"},
    //             required: true
    //         }]
    //     });
    //
    //     amount += parseFloat(cardTypee.swapLimit);
    //     if(userCameraLevel){
    //         const level = Math.floor(userCameraLevel.amount);
    //         amount += level * 100;
    //     }
    //
    // }

    const swaps = await Setting.find({type: "SWAP"});

    const result = [];
    for (let i = 0; i < swaps.length; i++) {
        const swap = swaps[i];

        const pairs = swap.key.split("->");

        const from_token = await Asset.findOne({title: pairs[0]});

        const to_token = await Asset.findOne({title: pairs[1]});

        if (!from_token || !to_token) continue;

        // const feeAmount = await fee({fromTokenId: from_token._id, toTokenId: to_token._id}, req.userEntity.id);
        const feeAmount = 100;

        const configs = swap.value.split("-");

        let config = [];
        for (let j = 0; j < configs.length; j++) {
            let temp = configs[j].split("=");
            if (temp[0] === "max" && from_token.title === "STL") {
                config.push({
                    action: temp[0],
                    value: amount,
                });
            } else {
                config.push({
                    action: temp[0],
                    value: temp[1],
                });
            }
        }

        result.push({
            from_token: from_token,
            to_token: to_token,
            fee: parseFloat(feeAmount),
            config: config,
        });
    }
    return result;
};

exports.add = async (data, user , io) => {
    let price;
    let assetIn;
    let assetOut;


    if (data.origin === "out") {
        assetIn = await Asset.findOne({address: data.assetInId});
        assetOut = await Asset.findOne({address: data.assetOutId});

    } else {
        assetIn = await Asset.findOne({address: data.assetOutId});
        assetOut = await Asset.findOne({address: data.assetInId});
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString();
    const query = {
        createdAt: {$gte: yesterday},
        userId: user._id,
        status: 'completed'
    };
    const swapHistory = await SwapTransaction.aggregate([
        {$match: query},
        {$group: {_id: "$userId", totalSwap: {$sum: "$balanceIn"}}},
    ])

    const setting = await Setting.findOne({key: assetIn.title + '->' + assetOut.title, deletedAt: null})
    if (!setting)
        throw new HumanError("Swap not found", 400);

    const maxSwap = parseSetting(setting.value, 'max')


    if ( swapHistory.length > 0? swapHistory[0].totalSwap : 0 >= maxSwap)
        throw new HumanError(`you can not swap more than ${maxSwap} ${assetIn.coin} per 24 hours`, 400);

    const sPrice = await swapPrice({
        fromToken: assetIn.title,
        toToken: assetOut.title,
        balanceIn: parseFloat(data.amount),
    });

    price = sPrice.price;

    const amount = parseFloat(data.amount);

    if (!assetIn || !assetOut) {
        throw new HumanError("Asset id not found", 400);
    }

    let walletIn = await UserWallet.findOne({userId: user._id, assetId: assetIn._id});
    if (!walletIn) {
        walletIn = await UserWallet.create({userId: user._id, assetId: assetIn._id, amount: 0});
    }

    let walletOut = await UserWallet.findOne({userId: user._id, assetId: assetOut._id});
    if (!walletOut) {
        walletOut = await UserWallet.create({userId: user._id, assetId: assetOut._id, amount: 0});
    }

    if (parseFloat(walletIn.amount) < amount) {
        throw new HumanError("You don't have enough balance", 400);
    }

    walletIn.amount -= parseFloat(amount);
    await walletIn.save();

    walletOut.amount += parseFloat(price);
    await walletOut.save();

    if (io){
        let ww = await UserWallet.find({userId: user._id}).lean()
        io.to(`UserId:${user._id}`).emit("wallet", JSON.stringify(ww));
    }

    await SwapTransaction.create({
        userId: user._id,
        assetInId: assetIn._id,
        assetOutId: assetOut._id,
        balanceIn: parseFloat(amount),
        amountOut: parseFloat(price),
        status: "DONE",
    });

    return "Success";
}
;

exports.get = async (data) => {
    let price;
    let assetIn;
    let assetOut;

    if (data.origin === "out") {
        assetIn = await Asset.findOne({address: data.assetInId});
        assetOut = await Asset.findOne({address: data.assetOutId});
        const sPrice = await swapPrice({
            fromToken: assetIn.title,
            toToken: assetOut.title,
            balanceIn: parseFloat(data.amount),
        });

        price = sPrice.price;
    } else {
        assetIn = await Asset.findOne({address: data.assetOutId});
        assetOut = await Asset.findOne({address: data.assetInId});
        const sPrice = await swapPrice({
            fromToken: assetIn.title,
            toToken: assetOut.title,
            balanceIn: parseFloat(data.amount),
        });

        price = sPrice.price;
    }

    if (!assetIn || !assetOut) {
        throw new HumanError("Asset id not found", 400);
    }

    return parseFloat(price);
};

exports.getAllSwapTransactionByManager = async (data) => {
    return new Promise(async (resolve, reject) => {
        const {
            limit,
            page,
            user,
            fee,
            order,
            createdAt,
            txId,
            amountOut,
            assetOut,
            assetIn,
            balanceIn,
            id,
            searchQuery,
            sort,
        } = data;
        let query = {};
        if (id) query._id = mongoose.Types.ObjectId(id);

        if (assetOut) {
            query = {"assetOutId.name": new RegExp(assetOut, "i")};
        }
        if (assetIn) {
            query = {"assetInId.name": new RegExp(assetIn, "i")};
        }
        if (user) {
            query = {"userId.username": new RegExp(user, "i")};
        }

        // if (price) {
        // 	query = { price : { $eq: price }};
        // }
        if (balanceIn) {
            //query.balanceIn = balanceIn;
            query.balanceIn = {$eq: balanceIn};
        }

        if (amountOut) {
            query.amountOut = {$eq: amountOut};
        }
        if (txId) {
            query.txId = new RegExp(txId, "i");
        }

        if (fee) {
            query.fee = {$eq: fee};
        }
        if (createdAt) {
            const {start, end} = dateQueryBuilder(createdAt);
            query.createdAt = {$gte: start, $lte: end};
        }

        //searchQuery
        if (searchQuery) {
            query["$or"] = [
                {
                    fee: {$eq: searchQuery},
                },
                {
                    amountOut: {$eq: searchQuery},
                },
                {
                    balanceIn: {$eq: searchQuery},
                },
                {
                    currentWalletInBalance: {$eq: searchQuery},
                },
                {
                    "assetInId.name": {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
                {
                    "assetOutId.name": {
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
                    txId: {
                        $regex: searchQuery || "",
                        $options: "i",
                    },
                },
            ];
        }

        let sortObject = {[sort]: order === "DESC" ? -1 : 1};
        if (sort === "amountOut") {
            sortObject = {["amountOut"]: order === "DESC" ? -1 : 1};
        }
        const result = await SwapTransaction.aggregate([
            {
                $lookup: {
                    from: "assets",
                    localField: "assetOutId",
                    foreignField: "_id",
                    as: "assetOutId",
                },
            },
            {$unwind: {path: "$assetOutId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "assets",
                    localField: "assetInId",
                    foreignField: "_id",
                    as: "assetInId",
                },
            },
            {$unwind: {path: "$assetInId", preserveNullAndEmptyArrays: true}},
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId",
                },
            },
            {$unwind: {path: "$userId", preserveNullAndEmptyArrays: true}},
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

        resolve({
            total: metadata?.total ?? 0,
            pageSize: limit,
            page: metadata?.page ?? page,
            data: items,
        });
    });
};

const swapPrice = async (data) => {
    try {
        let {fromToken, toToken, balanceIn} = data;
        if (fromToken == "BNB") {
            fromToken = "WBNB";
        }
        if (toToken == "BNB") {
            toToken = "WBNB";
        }
        const slippage = 1;
        const chain = "BSC";

        const from = await Asset.findOne({title: fromToken});
        const to = await Asset.findOne({title: toToken});

        const tokensInAddress = await Web3.utils.toChecksumAddress(from.address);
        const tokensOutAddress = await Web3.utils.toChecksumAddress(to.address);

        const routerV2 = await routerBuilder(chain, fromToken, toToken);

        let amount = await getAmountsOut(
            routerV2,
            tokensInAddress,
            tokensOutAddress,
            from.decimals,
            balanceIn,
            slippage,
        );

        if (!amount) {
            throw new Error("Internal Error");
        }

        // if (origin == "out") {
        //   amount = await getAmountsOut(
        //     routerV2,
        //     tokensInAddress,
        //     tokensOutAddress,
        //     from.decimals,
        //     balanceIn,
        //     slippage
        //   );
        // } else {
        //   amount = await getAmountsIn(
        //     routerV2,
        //     tokensInAddress,
        //     tokensOutAddress,
        //     to.decimals,
        //     balanceIn,
        //     slippage
        //   );
        // }

        const amountInWei = await Web3.utils.fromWei(amount.toString(), "ether");

        return {price: amountInWei};
    } catch (error) {
        console.log("*** swapAmount error", error);
        const errors = ["Chain No two tokens are the same"];
        if (errors.includes(error.message)) {
            throw new Error(error.message);
        } else {
            throw new Error("Internal Error");
        }
    }
};

async function routerBuilder(chain, fromToken, toToken) {
    let url = config.get("providers.bsc");
    // console.log({url})
    const provider = new JsonRpcProvider(url);
    // const provider = new ethers.providers.JsonRpcProvider(
    //     "HTTP://172.27.224.1:7545"
    // );

    const secretKey = process.env.SWAP_WALLET_SECRET_KEY;

    const account = new Wallet(secretKey, provider);

    const router = await routeAddress(fromToken, toToken);

    const routerAddress = await Web3.utils.toChecksumAddress(router); // Router

    return new ethers.Contract(
        routerAddress,
        [
            "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
            "function getAmountsIn(uint amountOut, address[] memory path) public view returns (uint[] memory amounts)",
            "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
            "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
            "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
            "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
            "function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
        ],
        account,
    );
}

async function routeAddress(fromToken, toToken) {
    const router = swapRouter.currencies.find((c) => c.tokens == `${fromToken}->${toToken}`);
    if (!router) {
        return swapRouter.routers.starz;
    }
    const routerAddress = swapRouter.routers[router.router];
    if (!routerAddress) {
        throw new Error(`Router Notfound`);
    }
    return routerAddress;
}

function parseSetting(string, field) {
    let chain = -1;

    let string1 = string.split("-");

    for (let i = 0; i < string1.length; i++) {
        const item = string1[i];

        if (item.search(field) > -1) {
            chain = item.split("=")[1];
            return chain;
        }
    }
    return undefined;
}
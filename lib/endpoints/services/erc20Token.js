const Web3 = require("web3");

const erc20Abi = require("./erc20-abi");
const {ethers} = require("ethers");

module.exports.getWeb3 = ({chain, fromPrivateKey, testnet = false}) => {
    let rpc;
    switch (chain) {
        case "ETH":
            rpc = testnet ? "https://rpc.ankr.com/eth_ropsten/" : "https://rpc.ankr.com/eth/";
            break;
        case "BSC":
            rpc = testnet ? "https://data-seed-prebsc-1-s1.binance.org:8545/" : "https://bsc-dataseed.binance.org/";
            break;
        case "MATIC":
            rpc = testnet ? "https://rpc-mumbai.maticvigil.com/" : "https://polygon-rpc.com/";
            break;
        default:
            throw Error("NOT_FOUND|chain not found");
    }

    const web3 = new Web3(rpc);
    if (fromPrivateKey) {
        web3.eth.accounts.wallet.clear();
        web3.eth.accounts.wallet.add(fromPrivateKey);
        web3.eth.defaultAccount = web3.eth.accounts.wallet[0].address;
    }
    return web3;
};

module.exports.sendTransaction = async ({web3, transaction, fromPrivateKey}) => {
    transaction.gasPrice = await web3.eth.getGasPrice();
    transaction.gas = await web3.eth.estimateGas(transaction);

    const signedTransaction = (await web3.eth.accounts.signTransaction(transaction, fromPrivateKey)).rawTransaction;

    return new Promise((resolve, reject) => {
        web3.eth.sendSignedTransaction(signedTransaction, (error, hash) => {
            if (error) return reject(error);
            resolve(hash);
        });
    });
};

module.exports.transfer = async ({chain, fromPrivateKey, from, contractAddress, to, amount, testnet}) => {
    const web3 = this.getWeb3({chain, fromPrivateKey, testnet});

    const contract = new web3.eth.Contract(erc20Abi, contractAddress);

    amount = web3.utils.toWei(amount + "");

    let transaction = {};
    if (contractAddress) {
        transaction = {
            to: contractAddress.trim(),
            data: contract.methods.transfer(to, amount).encodeABI(),
        };
    } else {
        transaction = {
            to: to,
            value: amount
        }
    }

    return await this.sendTransaction({web3, transaction, fromPrivateKey});
};

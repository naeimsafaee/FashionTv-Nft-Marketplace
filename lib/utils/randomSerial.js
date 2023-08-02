const {ethers , utils , BigNumber} = require("ethers");
const crypto = require("crypto");
const MAX_VALUE = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");

// const value = crypto.randomBytes(32);
// const bigInt = BigInt(`0x${value.toString("hex")}`);
// const bn = new BN(value.toString("hex"), 16);

const repAt = (string, index, chr) => {
    if (index > string.length - 1) return string;
    return string.substring(0, index) + chr + string.substring(index + 1);
};

exports.randomSerial = (len) => {
    let result = "";
    const numbers = "0123456789";
    let thisLen = len ? len : 32;
    let greater = false;
    do {
        for (let i = 0; i < thisLen; i++) {
            result += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        if (Number(result) > MAX_VALUE) {
            result = "";
            greater = true;
            thisLen--;
        } else greater = false;
    } while (greater);

    if (result[0] === "0") {
        result = repAt(result, 0, String(Math.floor(Math.random() * (9 - 1 + 1) + 1)));
    }

    return result;
};

exports.computeTokenIdFromMetadata = (metadata, creatorAddress) => {
    const sha1 = getSHA1(metadata);
    const creatorAddrHash = utils.keccak256(utils.defaultAbiCoder.encode(["uint160", "address"], [sha1, creatorAddress]));
    return BigNumber.from(sha1).toHexString() + creatorAddrHash.slice(2).substr(0, 24);
}

function getSHA1(input) {
    return `0x${crypto.createHash("sha1").update(input).digest("hex")}`
}
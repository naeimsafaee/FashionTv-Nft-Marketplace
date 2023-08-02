const {NotFoundError, HumanError, ConflictError, NotAuthorizedError} = require("./errorhandler");
const Errors = require("./errorhandler/MessageText");
const {Diamond, UserDiamond, Auction} = require("../../databases/mongodb");

function purchaseDiamond(data, user) {

    return new Promise(async (resolve, reject) => {
        const {auctionId} = data

        let auction = await Auction.findOne({
            _id: auctionId,
            status: 'ACTIVE',
            deletedAt: null
        });
        if (!auction)
            return reject(new NotFoundError(Errors.DIAMOND_NOT_FOUND.MESSAGE, Errors.DIAMOND_NOT_FOUND.CODE, {diamondId}),);

        auction.status = 'RESERVED';
        auction.userId = user._id;
        await auction.save();

        resolve("Successful");
    });
}

module.exports = {

    purchaseDiamond
}
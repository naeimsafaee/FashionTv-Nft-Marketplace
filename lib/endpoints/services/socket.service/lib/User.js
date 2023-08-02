const {jwt} = require("../../../../utils");
const {mongodb} = require("../../../../databases");
const Web3Token = require("web3-token");

module.exports = class User {
    constructor(token) {
        this.token = token;

        this.user = null;
    }

    async authentication() {

        const tokenArray = this.token?.split(" ");
        if (tokenArray?.[0] != "Bearer" || !tokenArray?.[1]) return null;

        const _token = tokenArray[1];

        let address;
        try {
            const verifyResult = Web3Token.verify(_token);
            address = verifyResult.address.toLowerCase();

        } catch (error) {
            // console.log(error)
            return null;
        }

        let user = await mongodb.User.findOne({address});

        if (!user) return null;


        return user;
    }

    async managerAuthentication() {
        const tokenArray = this.token?.split(" ");

        if (tokenArray?.[0] != "Bearer" || !tokenArray?.[1]) return null;

        const _token = tokenArray[1];

        //? Check token payload
        let payload = null;

        try {
            payload = jwt.verify(_token, null, "manager");

            if (!payload?.id || payload.userType !== "manager" || payload.tokenType !== "access") return null;
        } catch (e) {
            return null;
        }

        let user = await mongodb.Manager.findOne({_id: payload.id});

        return user;
    }
};

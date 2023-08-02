const {jwt} = require("./../utils");
const {NotAuthenticatedError, HumanError} = require("../endpoints/services/errorhandler");
const Errors = require("../endpoints/services/errorhandler/MessageText");
const {User, Manager, ManagerSession , AgentSession} = require("./../databases/mongodb");
const Web3Token = require("web3-token");

function throwError() {
    throw new NotAuthenticatedError(Errors.UNAUTHORIZED.CODE, Errors.UNAUTHORIZED.MESSAGE);
}

const userAuth = (userType, tokenType, requestType) => async (req, res, next) => {
    try {
        //? Check token existence
        let authorization = req?.headers?.authorization ?? null;

        if (!authorization) throwError();

        const tokenArray = authorization?.split(" ");

        if (tokenArray[0] != "Bearer" || !tokenArray[1]) throwError();

        token = tokenArray[1];

        //? Check token payload
        let payload = null;

        try {
            jwt.verify();
            payload = jwt.verify(token, null, userType);

            if (!payload?.id || userType !== payload.userType || tokenType !== payload.tokenType) throwError();
        } catch (e) {
            throwError();
        }

        //? find user
        let user = null,
            sessionModel,
            session;

        if (userType == "manager") {
            user = await Manager.findOne({_id: payload.id}).lean();

            sessionModel = ManagerSession;
        }
        if (userType == "agent") {
            user = await User.findOne({_id: payload.id, level: "AGENT"});

            sessionModel = AgentSession;
        }

        if (!user) throwError();

        if (tokenType == "refresh")
            session = await sessionModel.findOne({
                refreshToken: token,
                refreshExpiresAt: {$gt: +new Date()},
            }).lean();
        else
            session = await sessionModel.findOne({
                accessToken: token,
                accessExpiresAt: {$gt: +new Date()},
            }).lean();

        if (!session) throwError();

        req.sessionEntity = session;

        req.userEntity = user;

        next();
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * check user is authenticated
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const userAuthMiddleware = async (req, res, next) => {
    try {
        //? Check token existance
        let authorization = req?.headers?.authorization ?? null;

        if (!authorization) throwError();

        const tokenArray = authorization?.split(" ");

        if (tokenArray[0] != "Bearer" || !tokenArray[1]) throwError();

        let token = tokenArray[1];

        let address;
        try {
            const verifyResult = Web3Token.verify(token);
            address = verifyResult.address.toLowerCase();

        } catch (error) {
            console.log(error)
            throwError();
        }

        let user = await User.findOne({address});

        if (!user) throwError();

        req.userEntity = user;

        return next();
    } catch (error) {
        return res.status(error.statusCode).json(error);
    }
};

/**
 * check user is authenticated
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
const customAuthMiddleware = async (req, res, next) => {
    try {
        let authorization = req?.headers?.authorization ?? null;

        if (!authorization) return next();

        const tokenArray = authorization?.split(" ");

        if (tokenArray[0] != "Bearer" || !tokenArray[1]) throwError();

        token = tokenArray[1];

        let address;

        try {
            const verifyResult = await Web3Token.verify(token);
            address = verifyResult.address;
            let user = await User.findOne({address});
            req.userEntity = user;
        } catch (error) {
        } finally {
            return next();
        }
    } catch (error) {
        return res.status(error.statusCode).json(error);
    }
};

module.exports = {
    userAuthMiddleware,
    managerAuthMiddleware: userAuth("manager", "access"),
    managerAuthRefreshMiddleware: userAuth("manager", "refresh"),
    agentAuthMiddleware: userAuth("agent", "access"),
    agentAuthRefreshMiddleware: userAuth("agent", "refresh"),
    customAuthMiddleware,
};

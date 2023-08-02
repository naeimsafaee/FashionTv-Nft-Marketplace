const {
    httpResponse: {response},
    httpStatus,
} = require("../../utils");
const {competitionService, userTokenService} = require("../services");
const {userTokenController} = require("./index");

/**
 * create Competition
 */
exports.addCompetition = async (req, res) => {
    try {
        const data = await competitionService.addCompetition(req.body);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * get Competition list
 */
exports.getCompetitions = async (req, res) => {
    try {
        const data = await competitionService.getCompetitions(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * get one Competition
 */
exports.getCompetition = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await competitionService.getCompetition(id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * update one Competition
 */
exports.editCompetition = async (req, res) => {
    const io = req.app.get("socketIo");
    const {id} = req.params;
    const {title, status} = req.body;
    const data = await competitionService.editCompetition(id, title, status, io);
    return response({res, statusCode: httpStatus.OK, data});

};

/**
 * delete Competition
 */
exports.deleteCompetition = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await competitionService.deleteCompetition(id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};


exports.countCompetitionParticipant = async (req, res) => {
    try {
        const data = await competitionService.countCompetitionParticipant(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.competitionRank = async (req, res) => {
    try {
        const data = await competitionService.competitionRank(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        console.log({e})
        return res.status(e.statusCode).json(e);
    }
};

/**
 * add Task
 */
exports.addTask = async (req, res) => {
    try {
        const data = await competitionService.addTask(req.body, req.files);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};
/**
 * get Task list
 */
exports.getTasks = async (req, res) => {
    try {
        const data = await competitionService.getTasks(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * get one Task
 */
exports.getTask = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await competitionService.getTask(id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};
/**
 * edit Task
 */
exports.editTask = async (req, res) => {
    try {
        const data = await competitionService.editTask(req.params.id, req.body, req.files);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};
/**
 * delete Task
 */
exports.deleteTask = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await competitionService.deleteTask(id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

//user
exports.getTaskByUser = async (req, res) => {
    try {
        const data = await competitionService.getTasksByUser(req.query, req.userEntity);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

//user
exports.participateTask = async (req, res) => {
    try {
        // const {
        //     name,
        //     description,
        //     supply,
        //     chain,
        //     unblockableContent,
        //     url,
        //     explicitContent,
        //     properties,
        //     collectionId,
        //     isLazyMint,
        // } = req.body;
        //
        // const token = await userTokenService.addToken(
        //     name,
        //     description,
        //     supply,
        //     chain,
        //     unblockableContent,
        //     url,
        //     explicitContent,
        //     properties,
        //     req.files,
        //     collectionId,
        //     req.userEntity,
        //     req.fileValidationError,
        //     isLazyMint,
        // );
        const data = await competitionService.participateTask(req.body.tokenId, req.body, req.userEntity);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

/**
 * get one Competition
 */
exports.getCompetitionByUser = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await competitionService.getCompetitionByUser(id, req.userEntity);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.getMatchParticipant = async (req, res) => {
    try {
        const data = await competitionService.getMatchParticipant(req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

exports.updateMatchParticipant = async (req, res) => {
    try {
        const io = req.app.get("socketIo");
        const {userTaskId, score, status} = req.body;
        const data = await competitionService.updateMatchParticipant(userTaskId, parseFloat(score), status, io);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        if (!e.statusCode) return res.status(500).json(e);

        return res.status(e.statusCode).json(e);
    }
};

exports.getPrizeCompetition = async (req, res) => {
    try {
        const {id} = req.params;
        const data = await competitionService.getPrizeCompetition(id);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};
exports.getLeaderboards = async (req, res) => {
    try {
        const {diamondTypeId, competitionId, limit, page} = req.query;
        const data = await competitionService.getLeaderboards(diamondTypeId, competitionId, limit, page);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};
exports.getScoreMatchParticipant = async (req, res) => {
    try {
        const {participant_team_id} = req.params;
        const data = await competitionService.getScoreMatchParticipant(participant_team_id, req.query);
        return response({res, statusCode: httpStatus.OK, data});
    } catch (e) {
        return res.status(e.statusCode).json(e);
    }
};

const Joi = require("joi");
//competition
const getCompetitions = {
    query: {
        status: Joi.array().items(Joi.valid("OPEN", "COMPLETED", "INACTIVE")),
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
        order: Joi.valid("DESC", "ASC").default("DESC"),
        sort: Joi.string().default("createdAt"),
        title: Joi.string(),
        id: Joi.string(),
        createdAt: Joi.date(),
        startAt: Joi.date(),
        endAt: Joi.date(),
        searchQuery: Joi.string().allow(null, ""),
    },
};

const getCompetition = {
    params: {
        id: Joi.string().required().hex().length(24).messages({
            "string.hex": " invalid",
            "string.length": " invalid",
        }),
    },
};

const addCompetition = {
    body: {
        title: Joi.string().required(),
        startAt: Joi.date().required(),
        endAt: Joi.date().required(),
        status: Joi.valid("OPEN", "COMPLETED", "INACTIVE").default("INACTIVE"),
    },
};

const editCompetition = {
    params: {
        id: Joi.string().required().hex().length(24).messages({
            "string.hex": " invalid",
            "string.length": " invalid",
        }),
    },
    body: {
        title: Joi.string(),
        status: Joi.valid("OPEN", "COMPLETED", "INACTIVE"),
    },
};

const deleteCompetition = {
    params: {
        id: Joi.string().required().hex().length(24).messages({
            "string.hex": " invalid",
            "string.length": " invalid",
        }),
    },
};

const getTasks = {
    query: {
        competitionId: Joi.string(),
        diamondTypeId: Joi.string(),
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
        order: Joi.valid("DESC", "ASC").default("DESC"),
        sort: Joi.string().default("createdAt"),
        id: Joi.string(),
        createdAt: Joi.date(),
        searchQuery: Joi.string().allow(null, ""),
        title: Joi.string(),
    },
};

const getTask = {
    params: {
        id: Joi.string().required().hex().length(24).messages({
            "string.hex": " invalid",
            "string.length": " invalid",
        }),
    },
};

const addTask = {
    body: {
        competitionId: Joi.string().required(),
        diamondTypeId: Joi.string().required(),
        title: Joi.string().required(),
        description: Joi.string().required(),
    },
};

const editTask = {
    body: {
        competitionId: Joi.string(),
        diamondTypeId: Joi.string(),
        title: Joi.string(),
        description: Joi.string(),
    },
    params: {
        id: Joi.string().required().hex().length(24).messages({
            "string.hex": " invalid",
            "string.length": " invalid",
        }),
    },
};

const delTask = {
    params: {
        id: Joi.string().required().hex().length(24).messages({
            "string.hex": " invalid",
            "string.length": " invalid",
        }),
    },
};

const getTaskByUser = {
    query: {
        competitionId: Joi.string().required(),
        diamondTypeId: Joi.string().required(),
        diamondId: Joi.string().required(),
    },
};

const participateTask = {
    body: {
        taskId: Joi.string().required(),
        diamondId: Joi.string().required(),
        tokenId: Joi.string().required()
        // name: Joi.string().min(1).max(256).required(),
        // description: Joi.string().allow(null).max(400).required(),
        // supply: Joi.number().min(1).default(1),
        // collectionId: Joi.string().required().hex().length(24).messages({
        // 	"string.hex": " invalid",
        // 	"string.length": " invalid",
        // }),
        // explicitContent: Joi.boolean().default(false),
        // chain: Joi.valid("ETHEREUM", "POLYGON", "BSC").required(),
        // unblockableContent: Joi.string().max(200),
        // url: Joi.string(),
        // properties: Joi.string(),
        // isLazyMint: Joi.boolean().required(),
        // gRecaptchaResponse: Joi.string(),
    },
};

const getMatchParticipant = {
    query: {
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
        order: Joi.valid("DESC", "ASC").default("DESC"),
        sort: Joi.string().default("id"),
        createdAt: Joi.date(),
        searchQuery: Joi.string().allow(null, ""),
        userId: Joi.number(),
        competitionId: Joi.number(),
        username: Joi.string(),
        status: Joi.array().items(Joi.valid("OPEN", "CLOSE")),
        score: Joi.string(),
        competitionTitle: Joi.string(),
        id: Joi.number(),
    },
};

const updateMatchParticipant = {
    body: {
        userTaskId: Joi.string().required(),
        score: Joi.number().max(10).required(),
        status: Joi.valid("OPEN", "CLOSE").default("CLOSE"),
    },
};

const getPrizeCompetition = {
    params: {
        id: Joi.string().required(),
    },
};

const getLeaderboards = {
    query: {
        diamondTypeId: Joi.string().required(),
        competitionId: Joi.string().required(),
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
    },
};

const getScoreMatchParticipant = {
    params: {
        participant_team_id: Joi.string().required().hex().length(24).messages({
            "string.hex": " invalid",
            "string.length": " invalid",
        }),
    },
    query: {
        page: Joi.number().default(1).min(1),
        limit: Joi.number().default(10).min(1).max(100),
    },
};

const countCompetitionParticipant = {
    query: {
        competitionId: Joi.string(),
    }
};


const competitionRank = {
    query: {
        competitionId: Joi.string().required(),
        cardTypeId: Joi.string().required(),
        userName: Joi.string(),
    }
};

module.exports = {
    getCompetitions,
    getCompetition,
    addCompetition,
    editCompetition,
    deleteCompetition,
    getTasks,
    getTask,
    addTask,
    editTask,
    delTask,
    getTaskByUser,
    participateTask,
    getMatchParticipant,
    updateMatchParticipant,
    getPrizeCompetition,
    getLeaderboards,
    getScoreMatchParticipant,
    countCompetitionParticipant,
    competitionRank
};

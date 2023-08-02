var mongoose = require("./db");

//define user model
let User = require("./models/User");
const Manager = require("./models/Manager");
const ManagerSession = require("./models/ManagerSession");
const Category = require("./models/Category");
const Blog = require("./models/Blog");
const UserCollection = require("./models/UserCollection");
const UserToken = require("./models/UserToken");
const UserActivity = require("./models/UserActivity");
const UserAuctions = require("./models/UserAuctions");
const UserAuctionOffer = require("./models/UserAuctionsOffer");
const UserAssignedToken = require("./models/UserAssignedToken");
const UserFollowLike = require("./models/UserFollowLike");
const TokenEngagements = require("./models/TokenEngagement");
const InternalSetting = require("./models/InternalSetting");
const Setting = require("./models/Setting");
const EventBlockNumber = require("./models/EventBlockNumber");
const UserExplore = require("./models/UserExplore");
const UserCollectionStats = require("./models/UserCollectionStats");
const Brands = require("./models/Brand");
const UserApproval = require("./models/UserApproval");
const ManagerNotification = require("./models/ManagerNotification");
const ContractAddress = require("./models/ContractAddress");
const ContactUs = require("./models/ContactUs");
const Subscribe = require("./models/Subscribe");
const EventPerson = require("./models/EventPerson");
const Diamond = require("./models/Diamond");
const DiamondType = require("./models/DiamondType");
const UserDiamond = require("./models/UserDiamond");
const Competition = require("./models/Competition");
const Task = require("./models/Task");
const Leaderboard = require("./models/Leaderboard");
const UserTask = require("./models/UserTask");
const UserCategory = require("./models/UserCategory");
const Asset = require("./models/Asset");
const AssetNetwork = require("./models/AssetNetwork");
const Prize = require("./models/Prize");
const Network = require("./models/network");
const Auction = require("./models/auction");
const MatchParticipantTeam = require("./models/matchParticipantTeam");
const MatchParticipant = require("./models/matchParticipant");
const UserNotification = require("./models/userNotification");
const UserPrize = require("./models/userPrize");
const UserWallet = require("./models/userWallet");
const DiamondTrade = require("./models/diamondTrade");
const UserTransaction = require("./models/userTransaction");
const Permission = require("./models/permission");
const Role = require("./models/role");
const MangerLog = require("./models/managerLog");
const SwapTransaction = require("./models/swapTransaction");
const Ticket = require("./models/ticket");
const TicketReplyTemplate = require("./models/ticketReplyTemplate");
const Department = require("./models/department");
const Reply = require("./models/reply");
const AgentLink = require("./models/agentLink");
const AgentLinkStatistic = require("./models/agentLinkStatistic");
const AgentReport = require("./models/agentReport");
const AgentReward = require("./models/agentReward");
const AgentSession = require("./models/agentSession");
const AgentStatistic = require("./models/agentStatistic");
const Fee = require("./models/fee");
const ReferralReward = require("./models/referralReward");
const Currency = require("./models/Currency");

const models = {
    User,
    Manager,
    ManagerSession,
    Category,
    Blog,
    UserCollection,
    UserToken,
    UserActivity,
    UserAuctions,
    UserAuctionOffer,
    UserAssignedToken,
    UserFollowLike,
    TokenEngagements,
    InternalSetting,
    Setting,
    EventBlockNumber,
    UserExplore,
    UserCollectionStats,
    Brands,
    UserApproval,
    ManagerNotification,
    ContractAddress,
    ContactUs,
    Subscribe,
    EventPerson,
    Diamond,
    DiamondType,
    UserDiamond,
    Competition,
    Task,
    Leaderboard,
    UserTask,
    UserCategory,
    Asset,
    Prize,
    AssetNetwork,
    Network,
    Auction,
    MatchParticipantTeam,
    MatchParticipant,
    UserNotification,
    UserPrize,
    UserWallet,
    DiamondTrade,
    UserTransaction,
    Permission,
    Role,
    MangerLog,
    SwapTransaction,
    Ticket,
    TicketReplyTemplate,
    Department,
    Reply,
    AgentLink,
    AgentLinkStatistic,
    AgentReport,
    AgentReward,
    AgentSession,
    AgentStatistic,
    Fee,
    ReferralReward,
    Currency
};

module.exports = {...models, mongoose};

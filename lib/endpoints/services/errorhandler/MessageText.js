module.exports = {
	ADD_FAILED: {
		MESSAGE: "An error occurred while adding!",
		CODE: 1000,
	},
	UPDATE_FAILED: {
		MESSAGE: "An error occurred while updating!",
		CODE: 1001,
	},
	DELETE_FAILED: {
		MESSAGE: "An error occurred while deleting!",
		CODE: 1002,
	},
	ITEM_NOT_FOUND: {
		MESSAGE: "Item not found!",
		CODE: 1003,
	},
	NOT_EDITABLE: {
		MESSAGE: "The item is not editable!",
		CODE: 1004,
	},
	UNAUTHORIZED: {
		MESSAGE: "You're not authorized to access this resource",
		CODE: 1005,
	},
	CARD_LENGTH: {
		MESSAGE: "Cards must contain at least 3 items",
		CODE: 1006,
	},
	POSITION_WRONG: {
		MESSAGE: "Cards position is wrong!",
		CODE: 1007,
	},
	WALLET_LOW: {
		MESSAGE: "Wallet is low!",
		CODE: 1008,
	},
	STATUS_NOT_OPEN: {
		MESSAGE: "status not open!",
		CODE: 1009,
	},
	CARD_TYPE_INVALID: {
		MESSAGE: "Cards must contain type REWARD or TRANSFER",
		CODE: 1010,
	},
	CARD_STATUS_NOT_FREE: {
		MESSAGE: "Cards is not free",
		CODE: 1011,
	},
	CATEGORY_NOT_FOUND: {
		MESSAGE: "Category not found.",
		CODE: 1012,
	},
	BLOG_NOT_FOUND: {
		MESSAGE: "Blog not found",
		CODE: 1013,
	},
	BLOG_FAILED: {
		MESSAGE: "An error occurred while registering the blog",
		CODE: 1014,
	},
	USER_COLLECTION_NOT_FOUND: {
		MESSAGE: "User Collection not found",
		CODE: 1015,
	},
	MOBILE_FORMAT: {
		MESSAGE: "The entered mobile number is incorrect",
		CODE: 1016,
	},
	USER_NOT_FOUND: {
		MESSAGE: "There is no user with the details entered in the system",
		CODE: 1017,
	},
	EMAIL_AND_PASSWORD_INCORRECT: {
		MESSAGE: "Email or Password is incorrect",
		CODE: 1018,
	},
	MOBILE_AND_PASSWORD_INCORRECT: {
		MESSAGE: "Mobile or Password is incorrect",
		CODE: 1019,
	},
	USER_COLLECTION_FAILED: {
		MESSAGE: "An error occurred while registering the user collection",
		CODE: 1020,
	},
	REQUEST_SHOULD_HAVE_SIGNATURE: {
		MESSAGE: "Request should have signature and publicAddress",
		CODE: 1021,
	},
	NFT_FILE_UPLOAD_ERROR: {
		MESSAGE: "Please upload a NFT File",
		CODE: 1022,
	},
	USER_WITH_PUBLIC_ADDRESS_NOT_FOUND: {
		MESSAGE: "User with publicAddress is not found in database",
		CODE: 1023,
	},
	USER_ACTIVITY_NOT_FOUND: {
		MESSAGE: "User activity not found",
		CODE: 1024,
	},
	USER_ASSIGNED_TOKEN_NOT_FOUND: {
		MESSAGE: "User assigned token not found",
		CODE: 1025,
	},
	USER_AUCTION_NOT_FOUND: {
		MESSAGE: "User auction not found",
		CODE: 1026,
	},
	USER_AUCTION_OFFER_NOT_FOUND: {
		MESSAGE: "User auction offer not found",
		CODE: 1027,
	},
	USER_FAVORITES_NOT_FOUND: {
		MESSAGE: "User favorites not found",
		CODE: 1028,
	},
	USER_FOLLOW_OFFER_NOT_FOUND: {
		MESSAGE: "User follow not found",
		CODE: 1029,
	},
	DUPLICATE_USER_USERNAME: {
		MESSAGE: "User (username) already exist",
		CODE: 1030,
	},
	DUPLICATE_USER_EMAIL: {
		MESSAGE: "User (email) already exist",
		CODE: 1031,
	},
	AUCTION_ADD_FAILED: {
		MESSAGE: "Add new Auction failed",
		CODE: 1032,
	},
	DUPLICATE_USER_ADDRESS: {
		MESSAGE: "User (address) already exist",
		CODE: 1033,
	},
	ADDRESS_DOSE_NOT_EXIST: {
		MESSAGE: "Address does not exist",
		CODE: 1034,
	},
	USER_FOLLOW_RESPONSE_NOT_OK: {
		MESSAGE: "User follow responce not ok",
		CODE: 1035,
	},
	LIKED_TOKEN_ERROR: {
		MESSAGE: "An error occurred while liking the token",
		CODE: 1036,
	},
	UNLIKED_TOKEN_ERROR: {
		MESSAGE: "An error occurred while unliking the token",
		CODE: 1037,
	},
	LIKED_COLLECTION_ERROR: {
		MESSAGE: "An error occurred while liking the collection",
		CODE: 1038,
	},
	UNLIKED_COLLECTION_ERROR: {
		MESSAGE: "An error occurred while unliking the collection",
		CODE: 1039,
	},
	USER_TOKEN_NOT_FOUND: {
		MESSAGE: "User token not found",
		CODE: 1040,
	},
	USER_TOKEN_FAILED: {
		MESSAGE: "An error occurred while registering the user token",
		CODE: 1041,
	},
	TOKEN_EXPIRED: {
		MESSAGE: "Token expired",
		CODE: 1042,
	},
	USER_AUCTION_OFFER_FAILED: {
		MESSAGE: "An error occurred while registering the user auction offer",
		CODE: 1043,
	},
	USER_AUCTION_IS_NOT_ACTIVE_OR_FINISHED: {
		MESSAGE: "This auction is inactive or finished already",
		CODE: 1044,
	},
	USER_AUCTION_IS_NOT_STARTED: {
		MESSAGE: "Auction is not started yet.",
		CODE: 1045,
	},
	USER_AUCTION_IS_ENDED: {
		MESSAGE: "Auction is ended.",
		CODE: 1046,
	},
	USER_AUCTION_OFFER_AMOUNT_IS_LOWER_THAN_BASEPRICE: {
		MESSAGE: "Auction offer amount is lower than auction base price.",
		CODE: 1047,
	},
	USER_AUCTION_ALREADY_EXIST: {
		MESSAGE: "You already have an offer on this auction.",
		CODE: 1048,
	},
	INVALID_LINK: {
		MESSAGE: 'Link is invalid. example: {"name": "url"}',
		CODE: 1049,
	},
	UNAPPROVED_NFT: {
		MESSAGE: "Please approve your nft",
		CODE: 1050,
	},
	UNAPPROVED_WALLET: {
		MESSAGE: "Please approve your wallet",
		CODE: 1051,
	},
	START_IS_BIGGER_THAN_END: {
		MESSAGE: "Start is bigger than end",
		CODE: 1052,
	},
	USER_AUCTION_NOT_OWNER: {
		MESSAGE: "You cant accept or decline this offer.",
		CODE: 1053,
	},
	USER_AUCTION_OFFER_ALREADY_CANCELED: {
		MESSAGE: "The offer already canceled.",
		CODE: 1054,
	},
	USER_AUCTION_OFFER_ACCEPT_FAILED: {
		MESSAGE: "There wan an error while accepting bid.",
		CODE: 1055,
	},
	USER_AUCTION_WON_ALREADY_EXIST: {
		MESSAGE: "There is an accepted offer.",
		CODE: 1056,
	},
	USER_AUCTION_OFFER_ALREADY_WON: {
		MESSAGE: "This offer already accepted.",
		CODE: 1057,
	},
	USER_AUCTION_OFFER_ALREADY_NOT_WON: {
		MESSAGE: "This offer have not accepted.",
		CODE: 1058,
	},
	INVALID_PROPERTIES: {
		MESSAGE: 'Properties is invalid. example: {"key": "value"}',
		CODE: 1059,
	},
	INVALID_SUPPLY: {
		MESSAGE: "Supply must be greater or eqaul to 1",
		CODE: 1060,
	},
	INVALID_USER_STATUS: {
		MESSAGE: "Please send a valid status array. example ['ACTIVE', 'INACTIVE']",
		CODE: 1061,
	},
	SAME_OWNER: {
		MESSAGE: "You cannot operate an offer on your auction",
		CODE: 1062,
	},
	NFT_PREVIEW_FILE_UPLOAD_ERROR: {
		MESSAGE: "Please uplaod a preview for your NFT file.",
		CODE: 1063,
	},
	YOU_ARE_NOT_VERIFIED: {
		MESSAGE: "You are not verified.",
		CODE: 1064,
	},
	INVALID_ACTIVITY_TYPE: {
		MESSAGE: "Please send a valid status array. example ['LISTING', 'SELLES', 'OFFERS', 'TRANSFER', 'MINT']",
		CODE: 1065,
	},
	INVALID_ASSIGNED_TOKEN_STATUS: {
		MESSAGE: "Please send a valid status array. example ['FREE', 'IN_AUCTION', 'OFFERS', 'TRANSFERED', 'SOLD']",
		CODE: 1066,
	},
	INVALID_AUCTION_STATUS: {
		MESSAGE: "Please send a valid status array. example ['ACTIVE', 'INACTIVE', 'FINISH']",
		CODE: 1067,
	},
	INVALID_AUCTION_OFFER_STATUS: {
		MESSAGE: "Please send a valid status array. example ['CANCEL', 'REGISTER', 'ACCEPTED', 'DENIED']",
		CODE: 1068,
	},
	INVALID_COLLECTION: {
		MESSAGE: "Please send a valid collection array. example ['id', 'id', 'id']",
		CODE: 1069,
	},
	INVALID_CATEGORIES: {
		MESSAGE: "Please send a valid categories array. example ['id', 'id', 'id']",
		CODE: 1070,
	},
	RECAPTCHA_VERIFICATION_FAILED: {
		MESSAGE: "Failed captcha verification",
		CODE: 1071,
	},
	FILE_NOT_SUPPORTED: {
		MESSAGE: "Invalid file type",
		CODE: 1072,
	},
	INVALID_ADDRESS: {
		MESSAGE: "Address is invalid.",
		CODE: 1073,
	},
	EMPTY_ADDRESS: {
		MESSAGE: "Please send an address.",
		CODE: 1074,
	},
	DUPLICATE_CATEGORY: {
		MESSAGE: "Category already exist.",
		CODE: 1075,
	},
	CATEGORY_CANNOT_BE_ITS_PARENT: {
		MESSAGE: "Category cannot be its parent.",
		CODE: 1076,
	},
	SETTING_ALREADY_EXIST: {
		MESSAGE: "Setting already exist. please edit the existed one.",
		CODE: 1077,
	},
	SETTING_NOT_FOUND: {
		MESSAGE: "Setting not found.",
		CODE: 1078,
	},
	INVALID_CHAIN: {
		MESSAGE: "Invalid Chain",
		CODE: 1079,
	},
	BRAND_NOT_FOUND: {
		MESSAGE: "Brand not found",
		CODE: 1080,
	},
	BRAND_FAILED: {
		MESSAGE: "An error occurred while adding the brand",
		CODE: 1081,
	},
	BLOG_TITLE_DUPLICATE: {
		MESSAGE: "Duplicate blog title",
		CODE: 1082,
	},
	AMOUNT_APPROVER_IS_LOW: {
		MESSAGE: "amount approved is low",
		CODE: 1083,
	},
	WALLET_BALANCE_IS_LOW: {
		MESSAGE: "Wallet balance is low",
		CODE: 1084,
	},
	NOT_TOKEN_OWNER: {
		MESSAGE: "You're not owner of this token",
		CODE: 1085,
	},
	DUPLICATE_COLLECTION: {
		MESSAGE: "There is a collection with this name",
		CODE: 1086,
	},
	CONTACT_US_NOT_FOUND: {
		MESSAGE: "Contact us not found",
		CODE: 1087,
	},
	CONTACT_US_FAILED: {
		MESSAGE: "An error occurred while registering the contact us",
		CODE: 1088,
	},
	SUBSCRIBE_NOT_FOUND: {
		MESSAGE: "Subscribe not found",
		CODE: 1089,
	},
	SUBSCRIBE_FAILED: {
		MESSAGE: "An error occurred while registering the subscribe",
		CODE: 1090,
	},
	DUPLICATE_SUBSCRIBE: {
		MESSAGE: "Duplicate subscribe",
		CODE: 1091,
	},
	DUPLICATE_TOKEN: {
		MESSAGE: "There is a token with this name",
		CODE: 1092,
	},
	EVENT_PERSON_NOT_FOUND: {
		MESSAGE: "Event person not found",
		CODE: 1093,
	},
	SIGNATURE_UPLOAD: {
		MESSAGE: "Please upload signature file",
		CODE: 1094,
	},
	COMPETITION_NOT_FOUND: {
		MESSAGE: "Competition not found!",
		CODE: 1095,
	},
	COMPETITION_CLOSE: {
		MESSAGE: "This competition is closed!",
		CODE: 1096,
	},
	TASK_NOT_FOUND: {
		MESSAGE: "Task Not Found!",
		CODE: 1097,
	},
	DIAMOND_NOT_FOUND: {
		MESSAGE: "Diamond Not Found!",
		CODE: 1098,
	},
	Diamond_TYPE_NOT_FOUND: {
		MESSAGE: "Diamond Type Not Found!",
		CODE: 1099,
	},
	Diamond_TYPE_DELETE_FAILED: {
		MESSAGE: "Diamond TYPE DELETE FAILED",
		CODE: 1100,
	},
	Diamond_TYPE_CREATE_FAILED: {
		MESSAGE: "Diamond TYPE CREATE FAILED",
		CODE: 1101,
	},
	PARTICIPATE_TASK: {
		MESSAGE: "You have already participated in this task !",
		CODE: 1102,
	},
	ANY_DIAMOND: {
		MESSAGE: "You don not have any diamonds !",
		CODE: 1103,
	},
	COMPETITION_NOT_OPEN: {
		MESSAGE: "this competition is not open!",
		CODE: 1104,
	},
	ASSET_NETWORK_NOT_FOUND: {
		MESSAGE: "assetNetwork not found",
		CODE: 1105,
	},
	NOT_AUTHORIZE: {
		MESSAGE: "You are not authorized to access this content",
		CODE: 1106,
	},
	MATCH_PARTICIPENT_NOT_FOUND: {
		MESSAGE: "match participant not found",
		CODE: 1107,
	},
	TRANSACTION_NOT_FOUND: {
		MESSAGE: "transaction not found",
		CODE: 1108,
	},
	AUCTION_DIAMOND_NOT_FOUND: {
		MESSAGE: "aution diamond not found",
		CODE: 1109,
	},
	TICKET_NOT_FOUND: {
		MESSAGE: "ticket not found",
		CODE: 1110,
	},
	REPLY_NOT_FOUND: {
		MESSAGE: "reply not found",
		CODE: 1111,
	},

	REPLY_TEMPLATE_NOT_FOUND: {
		MESSAGE: "REPLY TEMPLATE not found",
		CODE: 1112,
	},

	DUPLICATE_REPLY_TEMPLATE: {
		MESSAGE: "DUPLICATE REPLY TEMPLATE",
		CODE: 1113,
	},

	MANAGER_NOT_FOUND: {
		MESSAGE: "manager not found",
		CODE: 1114,
	},
	DUPLICATE_DEPARTMENT: {
		MESSAGE: "DUPLICATE DEPARTMENT",
		CODE: 1115,
	},
	LINK_NOT_FOUND: {
		MESSAGE: "LINK NOT FOUND",
		CODE: 1116,
	},
	DUPLICATE_LINK: {
		MESSAGE: "DUPLICATE LINK",
		CODE: 1117,
	},
	LINK_UPDATE_FAILED: {
		MESSAGE: "LINK UPDATE FAILED",
		CODE: 1118,
	},
};

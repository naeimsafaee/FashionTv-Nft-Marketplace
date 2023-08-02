const mongoose = require("../db");
const Schema = mongoose.Schema;

const UserCategorySchema = new Schema(
    {
        UserCollection: {
            type: Schema.Types.ObjectId,
            ref: "userCollections",
            required: true,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "categories",
            required: true,
        },

        deletedAt: {type: Date, default: null},
    },
    {timestamps: true},
);

module.exports = mongoose.model("userCategories", UserCategorySchema);


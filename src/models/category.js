const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const CategorySchema = new Schema(
  {
    // categoryId: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },    
    categoryName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Create the model for CategoryDetails
const Category = mongoose.model("categories", CategorySchema);

module.exports = Category;


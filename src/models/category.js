const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");
// Define the schema for CategoryDetails
const CategorySchema = new Schema(
  {
    categoryTitle: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: User.modelName,
    },
    description: {
      type: String,
      required: true,
    },
    categoryDoc: {
      type: String,
      required: true,
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

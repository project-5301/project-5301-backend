const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");

const CategorySchema = new Schema(
  {   
    categoryName: {
      type: String,
      required: true,
    },
    categoryImage:{
      type: String
    },
  },
  {
    timestamps: true,
  }
);

// Create the model for CategoryDetails
const Category = mongoose.model("categories", CategorySchema);

module.exports = Category;


const CategoryDetails = require("../models/category");
const User = require("../models/user");

// Add new category detail
exports.addCategoryDetail = async (req, res) => {
  try {
    const { categoryId, categoryName } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!categoryId || !categoryName) {
      return res.status(400).json({ message: 'All fields are required' });
    }    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const categoryDetail = new CategoryDetails({
      categoryName,
      categoryId,
      createdBy: userId,
    });q
    console.log(categoryDetail);
    await categoryDetail.save();

    res.status(201).json({
      status: "success",
      data: categoryDetail,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Update category detail
exports.updateCategoryDetail = async (req, res) => {
  try {
    const { categoryID } = req.params;
    const { categoryId, categoryName } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const foundCategoryDetails = await CategoryDetails.findById(categoryID);
    if (!foundCategoryDetails) {
      return res.status(404).json({
        status: "error",
        message: "Category detail not found",
      });
    }

    if(foundCategoryDetails.createdBy.toString() !== userId){
      return res.status(400).json({
        message: "You don't have access to update this category, as you are not the owner of this category."
      })
    }

    const categoryDetail = await CategoryDetails.findByIdAndUpdate(
      categoryID,
      {
        categoryId,
        categoryName
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: categoryDetail,
    });
  } catch (error) {
    // Respond with error
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete category detailq
exports.deleteCategoryDetail = async (req, res) => {
  try {
    const { categoryID } = req.params;

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find category detail by ID
    const categoryDetail = await CategoryDetails.findById(categoryID);
    if (!categoryDetail) {
      return res.status(404).json({
        status: "error",
        message: "Category detail not found",
      });
    }

    // Check if the user who is trying to delete is the same user who created this category
    if (categoryDetail.createdBy.toString() !== userId) {
      return res.status(403).json({
        status: "error",
        message: "User not authorized to delete this category details",
      });
    }

    // Delete category detail
    await CategoryDetails.findByIdAndDelete(categoryID);

    // Respond with success
    res.status(200).json({
      status: "success",
      message: "Category detail deleted successfully",
    });
  } catch (error) {
    // Respond with error
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get category detail by ID
exports.getCategoryDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Find category detail by ID
    const categoryDetail = await CategoryDetails.findById(id);

    if (!categoryDetail) {
      return res.status(404).json({
        status: "error",
        message: "Category detail not found",
      });
    }

    // Respond with success
    res.status(200).json({
      status: "success",
      data: categoryDetail,
    });
  } catch (error) {
    // Respond with error
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get all category details
exports.getAllCategoryDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Find all category details
    const categoryDetails = await CategoryDetails.find({ createdBy: userId });    
    // Respond with success
    res.status(200).json({
      status: "success",
      data: categoryDetails,
    });
  } catch (error) {
    // Respond with error
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

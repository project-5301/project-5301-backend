const CategoryDetails = require("../models/category");
const User = require("../models/user");

// Add new category detail
exports.addCategoryDetail = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!categoryId || !categoryName) {
      return res.status(400).json({ status: 400, message: 'All fields are required', data: null });

    }    
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found", data: null });
    }
    const categoryDetail = new CategoryDetails({
      categoryName,
      createdBy: userId,
    });
    await categoryDetail.save();

    res.status(201).json({
      status: 201,
      message: "Category detail added successfully",
      data: categoryDetail,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: error.message,
      data: null,
    });
  }
};

// Update category detail
exports.updateCategoryDetail = async (req, res) => {
  try {
    const { categoryID } = req.params;
    const { categoryName } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found", data: null });
    }
    const foundCategoryDetails = await CategoryDetails.findById(categoryID);
    if (!foundCategoryDetails) {
      return res.status(404).json({
        status: 404,
        message: "Category detail not found",
        data: null,
      });
    }

    if(foundCategoryDetails.createdBy.toString() !== userId){
      return res.status(400).json({
        status: 403,
        message: "You are not authorized to update this category",
        data: null,    
        })
    }
    const categoryDetail = await CategoryDetails.findByIdAndUpdate(
      categoryID,
      {
        categoryName
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 200,
      message: "Category detail updated successfully",

      data: categoryDetail,
    });
  } catch (error) {
    // Respond with error
    res.status(400).json({
      status: 400,
      message: error.message,
      data: null,
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
      return res.status(404).json({
        status: 404,
        message: "Category detail not found",
        data: null, 
      });
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
        status: 403,
        message: "You are not authorized to delete this category detail",
        data: null,
      });
    }

    // Delete category detail
    await CategoryDetails.findByIdAndDelete(categoryID);

    // Respond with success
    res.status(200).json({
      status: 200,
      message: "Category detail deleted successfully",
      data: null,
    });
  } catch (error) {
    // Respond with error
    res.status(400).json({
      status: 400,
      message: error.message,
      data: null,
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
      return res.status(404).json({ status: 404, message: "User not found", data: null });
    }
    // Find category detail by ID
    const categoryDetail = await CategoryDetails.findById(id);

    if (!categoryDetail) {
      return res.status(404).json({
        status: 404,
        message: "Category detail not found",
        data: null,
      });
    }

    // Respond with success
    res.status(200).json({

      status: 200,
      message: "Category detail retrieved successfully",

      data: categoryDetail,
    });
  } catch (error) {
    // Respond with error
    res.status(400).json({
      status: 400,
      message: error.message,
      data: null,
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
    const categoryDetails = await CategoryDetails.find({ createdBy: userId }).sort({createdAt: -1});
    // Respond with success
    res.status(200).json({
      status: 200,
      message: "All category details retrieved successfully",

      data: categoryDetails,
    });
  } catch (error) {
    // Respond with error
    res.status(400).json({
      status: 400,
      message: error.message,
      data: null,
    });
  }
};

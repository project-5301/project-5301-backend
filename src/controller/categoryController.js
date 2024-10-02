const Category = require("../models/category");
const {uploadSingleImageToCloudflare} = require("../utils/upload")

const createCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    let categoryImage = null;
    const file = req.file;
    const imageUrl = await uploadSingleImageToCloudflare(file, "image");
    categoryImage = imageUrl;
    const category = new Category({
      categoryName,
      categoryImage,
    });

    await category.save();
    res
      .status(201)
      .json({status: 201, message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({status: 500, message: "Failed to create category", error: error.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

// Update category
const updateCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    let categoryImage = null;
    const file = req.file;
    const imageUrl = await uploadSingleImageToCloudflare(file, "image");
    categoryImage = imageUrl;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        categoryName, categoryImage
      },
      { new: true } // Return the updated document
    );
    console.log(req.params.id)

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Delete category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};

// Export all the functions
module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

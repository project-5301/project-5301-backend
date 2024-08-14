const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route to add new category detail
router.post("/add", authMiddleware, categoryController.addCategoryDetail);

// Route to update category detail
router.put(
  "/update/:id",
  authMiddleware,
  categoryController.updateCategoryDetail
);

// Route to delete category detail
router.delete(
  "/delete/:id",
  authMiddleware,
  categoryController.deleteCategoryDetail
);

// Route to get category detail by ID
router.get(
  "/get/:id",
  authMiddleware,
  categoryController.getCategoryDetailById
);

// Route to get all category details
router.get("/all", authMiddleware, categoryController.getAllCategoryDetails);

module.exports = router;

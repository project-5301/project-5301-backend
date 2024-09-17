const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route to add new category detail
router.post("/", authMiddleware, categoryController.addCategoryDetail);

// Route to update category detail
router.patch(
  "/:categoryID",
  authMiddleware,
  categoryController.updateCategoryDetail
);

// Route to delete category detail
router.delete(
  "/:categoryID",
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
router.get("/", authMiddleware, categoryController.getAllCategoryDetails);

module.exports = router;

const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categoryController");
const multer = require('multer');
const upload = multer();
// Route to add new category detail
router.post("/", upload.single('image'),  categoryController.createCategory);

// Route to update category detail
router.put(
  "/:id",
  upload.single("image"),
  categoryController.updateCategory
);

// Route to delete category detail
router.delete(
  "/:id", 
  categoryController.deleteCategory
);

// Route to get category detail by ID
router.get(
  "/get/:id",
  categoryController.getCategoryById
);


router.get(
  "/all",
  categoryController.getAllCategories
);


module.exports = router;

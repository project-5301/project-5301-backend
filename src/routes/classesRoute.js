const express = require("express");
const router = express.Router();
const classController = require("../controller/classesController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route to add new category detail
router.post("/create", classController.create);

// Route to get category detail by ID
router.get(
    "/get/:id",
    authMiddleware,
    classController.fetch
);
// Route to update category detail
router.patch(
    "/category/:categoryID",
    authMiddleware,
    classController.update
);

// Route to delete category detail
router.delete(
    "/category/:categoryId",
    authMiddleware,
    classController.remove
);


module.exports = router;

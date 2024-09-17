const express = require("express");
const router = express.Router();
const classController = require("../controller/classesController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route to add new category detail
router.post("/", classController.create);

// Route to get category detail by ID
router.get(
    "/:id",
    authMiddleware,
    classController.fetch
);
// Route to update category detail
router.patch(
    "/:id",
    authMiddleware,
    classController.update
);

// Route to delete category detail
router.delete(
    "/:id",
    authMiddleware,
    classController.remove
);

router.get(
    "/",
    authMiddleware,
    classController.allClasses
);

module.exports = router;

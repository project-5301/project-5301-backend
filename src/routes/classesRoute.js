const express = require("express");
const router = express.Router();
const classController = require("../controller/classesController");
const authMiddleware = require("../middlewares/authMiddleware");

// Route to add new category detail
router.post("/classes", classController.create);

// Route to get category detail by ID
router.get(
    "/classes",
    authMiddleware,
    classController.fetch
);
// Route to update category detail
router.patch(
    "/:classId",
    authMiddleware,
    classController.update
);

// Route to delete category detail
router.delete(
    "/:classId",
    authMiddleware,
    classController.remove
);


module.exports = router;

const express = require("express");
const router = express.Router();
const deletecontroller = require("../controller/deleteController");
const authMiddleware = require("../middlewares/authMiddleware");

router.put("/soft-delete", authMiddleware, deletecontroller.softDeleteAccount);

router.put("/restore-account", authMiddleware, deletecontroller.restoreAccount);

module.exports = router;

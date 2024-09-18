const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  onboard,
  updateUserDetails,
  getUserDetails,
} = require("../controller/userController");
const multer = require("multer");
const upload = multer({});

// Initialize the router
const router = express.Router();

router.post(
  "/onboard",
  upload.single("profilePicture"),
  authMiddleware,
  onboard
);

// Route for updating user details
router.put(
  "/update-details",
  upload.single("profilePicture"),
  authMiddleware,
  updateUserDetails
);

// Route for getting user details
router.get("/details", authMiddleware, getUserDetails);

module.exports = router;

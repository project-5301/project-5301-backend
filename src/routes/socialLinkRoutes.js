const express = require("express");
const router = express.Router();
const {
  addSocialLink,
  updateSocialLink,
  removeSocialLink,
  getSocialLinks,
} = require("../controller/SocialLinkController");
const authMiddleware = require("../middlewares/authMiddleware");

// Add a new social link for a provider
router.post("/", authMiddleware, addSocialLink);

// Update a specific social link for a provider
router.put("/:socialId",authMiddleware, updateSocialLink);

router.delete("/:socialId", authMiddleware, removeSocialLink);

// Get all social links for a provider
router.get("/", authMiddleware, getSocialLinks);

module.exports = router;

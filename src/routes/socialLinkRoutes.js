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
router.post("/:id", authMiddleware, addSocialLink);

// Update a specific social link for a provider
router.put("/:id/:socialId",authMiddleware, updateSocialLink);

router.delete("/:id/:socialId", authMiddleware, removeSocialLink);

// Get all social links for a provider
router.get("/:id", getSocialLinks);

module.exports = router;

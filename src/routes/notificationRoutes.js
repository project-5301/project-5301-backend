const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  createNotification,
  getNotificationsForUser,
  updateNotificationStatus,
} = require("../controller/notificationController");

router.post("/", authMiddleware, createNotification);
router.get("/users/:userId", authMiddleware, getNotificationsForUser);
router.put(
  "/:notificationId/recipients/:userId/status",
  authMiddleware,
  updateNotificationStatus
);

module.exports = router;

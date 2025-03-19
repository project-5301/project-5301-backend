const authMiddleware = require("../middlewares/authMiddleware")
const UserNotificationPreferenceController = require("../controller/userNotificationPreferanceController")
const router = require("express").Router()

router
    .post("/", authMiddleware, UserNotificationPreferenceController.addUserNotificationPreferences)
    .get("/", authMiddleware, UserNotificationPreferenceController.getUserNotificationPreferences)
    .put("/", authMiddleware, UserNotificationPreferenceController.updateUserNotificationPreferences)

module.exports = router

const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const category = require("./categoryRoutes");
const userRoutes = require("./usersRoutes");
const notificationRoutes = require("./notificationRoutes");
const classRoutes = require("./classesRoute");
const providersRoutes = require("./providersRoutes");
//const getCampaignAnalyticsRoutes = require("./campaignAnalyticsRoutes"); 
// const authMiddleware = require("../middlewares/authMiddleware");

router.use("/auth", authRoutes);
router.use("/category", category);
//router.use("/sub-category", subCategory);
//router.use("/campaigns", camapignRoutes);
router.use("/user", userRoutes);
router.use("/notifications", notificationRoutes);

router.use("/providers", providersRoutes);
router.use("/class", classRoutes);
//router.use("/campaign-analytics", getCampaignAnalyticsRoutes);
module.exports = router;

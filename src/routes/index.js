const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const category = require("./categoryRoutes");
const userRoutes = require("./usersRoutes");
const classRoutes = require("./classesRoute");

const providersRoutes = require("./providersRoutes");
const workSampleRoutes = require("./workSampleRoutes")

const socialLinkRoutes = require("./socialLinkRoutes")
const topRoutes = require("./topRoutes")
const deleteRoutes = require("./deleteRoutes")
const infoRoutes = require("./infoRoutes");


router.use("/auth", authRoutes);
router.use("/category", category);
router.use("/user", userRoutes);

router.use("/providers", providersRoutes);
router.use("/class", classRoutes);


router.use("/work-samples", workSampleRoutes); 

router.use("/social-links", socialLinkRoutes );
router.use("/top-providers", topRoutes)
router.use("/delete", deleteRoutes)
router.use("/info", infoRoutes);

module.exports = router;

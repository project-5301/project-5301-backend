const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const topProviderController = require("../controller/topProviderController")

router.get("/", topProviderController.getTopProviders)

module.exports = router;

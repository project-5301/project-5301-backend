const express = require("express");
const router = express.Router();
const workSampleController = require("../controller/workSampleController"); 
const authMiddleware = require("../middlewares/authMiddleware");

// Route to add a new work sample to a provider
router.post(
  "/:id",
  authMiddleware,
  workSampleController.addWorkSample
);

// Route to get all work samples of a specific provider
router.get(
  "/:id",
  authMiddleware,
  workSampleController.getWorkSamples
);

// Route to update a specific work sample of a provider
router.put(
  "/:providerId/:sampleId",
  authMiddleware,
  workSampleController.updateWorkSample
);

// Route to delete a specific work sample of a provider
router.delete(
  "/:providerId/:sampleId",
  authMiddleware,
  workSampleController.deleteWorkSample
);

module.exports = router;

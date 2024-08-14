const mongoose = require("mongoose");

const SentDataSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    userId: { type: String, required: true },
    sentAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SentData", SentDataSchema);
const mongoose = require("mongoose");

const RepliedDataSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    userId: { type: String, required: true },
    repliedAt: { type: Date, default: Date.now },
    experience: { type: String },
    amount: { type: Number },
    address: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RepliedData", RepliedDataSchema);
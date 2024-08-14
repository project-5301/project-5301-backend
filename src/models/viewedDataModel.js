const mongoose = require("mongoose");

const ViewDataSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    userId: { type: String, required: true },
    viewedAt: { type: Date, default: Date.now },
    experience: { type: String },
    amount: { type: Number },
    address: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ViewData", ViewDataSchema);
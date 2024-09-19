const mongoose = require("mongoose");

// Define the schema
const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    optionsAvailable: {
      type: Number,
      required: true,
    },
    filledOptions: {
      type: Number,
      default: 0,
    },
    availability: {
      type: Boolean,
      default: false,
    },
    providerId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Create the model
const classes = mongoose.model("class", classSchema);

module.exports = classes;

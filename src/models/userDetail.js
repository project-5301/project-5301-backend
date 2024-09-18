const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema({
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  profilePicture: { type: String },
  phoneNumber: { type: String, required: true }, // Phone number field
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("UserDetails", UserDetailsSchema);
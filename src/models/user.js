const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isProvider: { type: Boolean, default: false },
  userProfile: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  phoneNumber: { type: String, required: true }, // Phone number field
  blacklistedTokens: [{ type: String }], // Field to store blacklisted tokens
}, { timestamps: true });

// Method to check if a token is blacklisted
UserSchema.methods.isTokenBlacklisted = function (token) {
  return this.blacklistedTokens.includes(token);
};


// Method to add a token to the blacklist
UserSchema.methods.blacklistToken = function (token) {
  if (!this.blacklistedTokens.includes(token)) {
    this.blacklistedTokens.push(token);
  }
};

module.exports = mongoose.model("User", UserSchema);
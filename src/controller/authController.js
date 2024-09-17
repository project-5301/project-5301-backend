const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();
const logger = require("../utils/logger");
const { sendEmail } = require("./emailService");

// Register User
const registerUser = async (req, res) => {
  const { username, email, password, isProvider } = req.body;

  try {

    if (!email || email.trim() === '') { 
      return res.status(400).json({ message: "A valid email is required" });
  }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Default isProvider to false if not provided
    const userIsProvider = isProvider || false;

    // Create new user
    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      isProvider: userIsProvider,
    });

    // Generate JWT token
    const token = generateToken(user);
    await user.save();

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      token,
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).send("Server error");
  }
};

//Register Provider

const registerProvider = async (req, res) => {
  const { username, email, password, isProvider } = req.body;

  try {

    if (!email || email.trim() === '') { 
      return res.status(400).json({ message: "A valid email is required" });
  }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }


   // Default isProvider to true if not provided
   const providerIsProvider = isProvider || true;

    // Create new user
    user = new User({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      isProvider: providerIsProvider,
    });

    // Generate JWT token
    const token = generateToken(user);
    await user.save();

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      token,
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).send("Server error");
  }
};




// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if token is blacklisted
    if (user.blacklistedTokens.includes(req.header("Authorization")?.replace("Bearer ", ""))) {
      return res.status(403).json({ message: "Token is blacklisted, please log in again" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      status: 200,
      message: "User logged in successfully",
      token,
    });
  } catch (err) {
    logger.error("Error during user login:", err);
    res.status(500).send("Server error");
  }
};

// Logout User
const logoutUser = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  try {
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the token and decode user ID
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Add the token to the blacklist
    user.blacklistedTokens.push(token);
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (err) {
    logger.error("Error during user logout:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password
const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetPasswordExpire = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();

    const subject = "Password reset";
    const text = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   http://${req.headers.host}/reset/${resetToken}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`;

    await sendEmail(email, subject,text);

    res.status(200).json({
      status: 200,
      message: "Password reset email sent successfully",
    });
  } catch (err) {
    res.status(500).send("Server error");
  }
};

// Update Password
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, phoneNumber } = req.body; // Include phoneNumber
  const token = req.header("Authorization")?.replace("Bearer ", "");

  try {
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify the token and decode user ID
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Update phone number
    user.phoneNumber = phoneNumber || user.phoneNumber; // Update phoneNumber

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Password updated successfully",
    });
  } catch (err) {
    logger.error("Error updating password:", err.message);
    res.status(500).send("Server error");
  }
};

// Get user details by email
const getUserByEmail = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ userEmail: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude the password from the response
    const { password, ...userDetails } = user.toObject();

    res.status(200).json({
      status: "success",
      userDetails: [userDetails],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendOTP = async (req, res) => {
  const { userEmail } = req.body;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    // Generate OTP
    const otp = crypto.randomInt(1000, 9999).toString();

    user.resetPasswordToken = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await user.save();

    // Email subject and content
    const subject = "Your OTP for Password Reset";
    const text = `Dear ${user.username},\n\nYou requested to reset your password. Use the OTP below to reset your password. The OTP will expire in 10 minutes.\n\nOTP: ${otp}\n\nBest Regards,\nThe Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Password Reset OTP</h2>
        <p>Dear ${user.username},</p>
        <p>You requested to reset your password. Use the OTP below to reset your password. The OTP will expire in 10 minutes.</p>
        <p style="font-size: 1.2em; font-weight: bold; color: #444;">OTP: <span style="color: #d9534f;">${otp}</span></p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have any concerns.</p>
        <p>Best Regards,<br>The Team</p>
        <hr>
        <p style="font-size: 0.9em; color: #666;">
          You received this email because you requested a password reset. If you did not request this, please ignore it.
        </p>
      </div>
    `;

    // Send the OTP via email
    await sendEmail(userEmail, subject, html);
    res.status(200).json({ message: 'OTP sent to email successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyOTP = async (req, res) => {
  const { userEmail, otp } = req.body;

  try {
    // Check if the user exists and if the OTP is valid
    const user = await User.findOne({ userEmail, resetPasswordToken: otp });
    if (!user || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const { userEmail, otp, newPassword } = req.body;

  try {
    // Check if the vendor exists and if the OTP is valid
    const user = await User.findOne({ userEmail, resetPasswordToken: otp });
    if (!user || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    // Clear the reset token and expiration
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  };
};

module.exports = {
  registerUser,
  registerProvider,
  loginUser,
  logoutUser,
  forgetPassword,
  updatePassword,
  getUserByEmail,
  sendOTP, verifyOTP, changePassword
};
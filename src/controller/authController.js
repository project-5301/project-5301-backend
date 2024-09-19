const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();
const logger = require("../utils/logger");
const { sendEmail } = require("./emailService");
const { response } = require("express");

// Register User
const registerUser = async (req, res) => {
  const { username, email, password, isProvider } = req.body;
  try {
    if (!email || email.trim() === '') { 
      return res.status(400).json({ status: 400, message: "A valid email is required" });
  }
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ status: 400, message: "User already exists" });
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
    const { password: _, ...userDetails } = user.toObject();
    // Generate JWT token
    const token = generateToken(user);
    await user.save();

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      token,
      data: {
        ...userDetails
      },
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ status: 500, message: 'Server error' });
  }
};

//Register Provider

const registerProvider = async (req, res) => {
  const { username, email, password, isProvider } = req.body;

  try {

    if (!email || email.trim() === '') { 
      return res.status(400).json({ status: 400, message: "A valid email is required" });
  }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ status: 400, message: "User already exists" });
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
    const providerId = user._id;
    const { password: _, ...userDetails } = user.toObject();
    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      token,
      data: {
        ...userDetails,
        providerId
      },
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ status: 500, message: 'Server error' });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 401, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 401, message: "Invalid credentials" });
    }

    const token = generateToken(user);

     const responseData = {
      // Include 'providerId' or 'userId' based on the isProvider flag
      [user.isProvider ? 'providerId' : 'userId']: user._id,
      isProvider: user.isProvider,
    };
    
    res.status(200).json({
      status: 200,
      message: "User logged in successfully",
      token,
      responseData, user
    });
  } catch (err) {
    logger.error("Error during user login:", err);
    res.status(500).json({ status: 500, message: 'Server error' });
  }
};

// Logout User
const logoutUser = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  try {
    if (!token) {
      return res
        .status(401)
        .json({ status: 401, message: "No token provided" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    // Add the token to the blacklist
    user.blacklistToken(token); // Add the token to the blacklist using the schema method
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Logged out successfully",
    });
  } catch (err) {
    logger.error("Error during user logout:", err);
    res.status(500).json({ status: 500, message: "Server error", error: err.message });
  }
};



// Update Password
const updatePassword = async (req, res) => {
  const { oldPassword, newPassword} = req.body; 
  const token = req.header("Authorization")?.replace("Bearer ", "");

  try {
    if (!token) {
      return res.status(401).json({ status: 401, message: "No token, authorization denied" });
    }

    // Verify the token and decode user ID
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const userId = decoded.id;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({status:404, message: "User not found"});
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({status:400, message: "Old password is incorrect"});
    }

    // Hash and update new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      status: 200,
      message: "Password updated successfully",
    });
  } catch (err) {
    logger.error("Error updating password:", err.message);
    res.status(500).json({status:500, message: 'Server error'});
  }
};

// Get user details by email
const getUserByEmail = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({status:404, message: "User not found" });
    }

    // Exclude the password from the response
    const { password,resetPasswordExpire,resetPasswordToken, ...userDetails } = user.toObject();

    res.status(200).json({
      status: "success",
      userDetails
    });
  } catch (error) {
    res.status(500).json({status:500, message: error.message });
  }
};

const sendOTP = async (req, res) => {
  const { userEmail } = req.body;

  try {
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({status:400, message: 'User does not exist' });
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

    console.log(otp)
    await sendEmail(userEmail, subject, html);
    res.status(200).json({ message: 'OTP sent to email successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({status:500, message: 'Server error' });
  }
};

const verifyOTP = async (req, res) => {
  const { userEmail, otp } = req.body;

  if (!userEmail || !otp) {
    return res
      .status(400)
      .json({ status: 400, message: "Email and OTP are required", data: null });
  }

  try {
    console.log(`Verifying OTP for email: ${userEmail} and OTP: ${otp}`);

    // Find the user
    const user = await User.findOne({
      email: userEmail,
      resetPasswordToken: otp,
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid OTP", data: null });
    }

    const currentTime = Date.now();
    console.log(`Current Time: ${currentTime}`);

    // Convert expiry date to milliseconds
    const expiryTime = new Date(user.resetPasswordExpire).getTime();
    console.log(`Expiry Time: ${expiryTime}`);

    // Check OTP expiry
    if (expiryTime < currentTime) {
      return res
        .status(400)
        .json({ status: 400, message: "Expired OTP", data: null });
    }

    res.status(200).json({ status: 200, message: "OTP verified successfully" });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    res.status(500).json({ status: 500, message: "Server error", data: null });
  }
};




const changePassword = async (req, res) => {
  const { userEmail, newPassword } = req.body;

  if (!userEmail || !newPassword) {
    return res
      .status(400)
      .json({
        status: 400,
        message: "Email new password are required",
        data: null,
      });
  }

  try {
    // Check if the user exists and if the OTP is valid
    const user = await User.findOne({
      email: userEmail,
    });

    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid OTP", data: null });
    }
    // Hash the new password and update the user
    user.password = await bcrypt.hash(newPassword, 10);


    await user.save();

    res
      .status(200)
      .json({ status: 200, message: "Password changed successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ status: 500, message: "Server error", data: null });
  }
};


module.exports = {
  registerUser,
  registerProvider,
  loginUser,
  logoutUser,
  // forgetPassword,
  updatePassword,
  getUserByEmail,
  sendOTP, verifyOTP, changePassword
};
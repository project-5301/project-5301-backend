const UserDetails = require("../models/userDetail");
const User = require("../models/user");
const logger = require("../routes/utils/logger");

// Regular expression for phone number validation
const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format

const onboard = async (req, res) => {
  const { dob, gender, profilePicture, phoneNumber } = req.body; // Include phoneNumber

  // Validate phone number
  if (!phoneNumberRegex.test(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Parse dob string into a Date object
    const [day, month, year] = dob.split("/");
    const parsedDob = new Date(`${year}-${month}-${day}`);

    // Create UserDetails linked to the existing User
    const userDetails = new UserDetails({
      userName: user.userName,
      dob: parsedDob,
      gender,
      profilePicture,
      phoneNumber, // Save phoneNumber
      userId: user._id,
    });

    const savedUserDetails = await userDetails.save();

    return res.status(201).json({
      message: "User details onboarded successfully",
      userDetails: savedUserDetails,
    });
  } catch (error) {
    logger.error("Error during onboarding:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateUserDetails = async (req, res) => {
  const { dob, gender, profilePicture, phoneNumber } = req.body; // Include phoneNumber

  // Validate phone number
  if (phoneNumber && !phoneNumberRegex.test(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }

  try {
    // Find the existing user details
    let userDetails = await UserDetails.findOne({ userId: req.user.id });

    if (!userDetails) {
      return res.status(404).json({ message: "User details not found" });
    }

    // Update the user details
    const [day, month, year] = dob.split("/");
    const parsedDob = new Date(`${year}-${month}-${day}`);

    userDetails.dob = parsedDob || userDetails.dob;
    userDetails.gender = gender || userDetails.gender;
    userDetails.profilePicture = profilePicture || userDetails.profilePicture;
    userDetails.phoneNumber = phoneNumber || userDetails.phoneNumber; // Update phoneNumber

    const updatedUserDetails = await userDetails.save();

    return res.status(200).json({
      message: "User details updated successfully",
      userDetails: updatedUserDetails,
    });
  } catch (error) {
    logger.error("Error updating user details:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    // Find the user details by userId
    const userDetails = await UserDetails.findOne({ userId: req.user.id });

    if (!userDetails) {
      return res.status(404).json({ message: "User details not found" });
    }

    return res.status(200).json({
      userDetails,
      user,
    });
  } catch (error) {
    logger.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { onboard, updateUserDetails, getUserDetails };
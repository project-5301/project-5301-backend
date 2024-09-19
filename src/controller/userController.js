const UserDetails = require("../models/userDetail");
const User = require("../models/user");
const logger = require("../utils/logger");
const { uploadSingleImageToCloudflare } = require("../utils/upload");

// Regular expression for phone number validation
const phoneNumberRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format

const onboard = async (req, res) => {
  const { dob, gender, phoneNumber, firstName, lastName, bio } = req.body;
  const file = req.file;

  if (!phoneNumberRegex.test(phoneNumber)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid phone number format",
      data: null,
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not found", data: null });
    }
    const existingUserDetails = await UserDetails.findOne({
      userId: req.user.id,
    });
    if (existingUserDetails) {
      return res
        .status(400)
        .json({ status: 400, message: "User has already onboarded" });
    }
    const [day, month, year] = dob.split("/");
    const parsedDob = new Date(`${year}-${month}-${day}`);

    if (file) {
      const imageUrl = await uploadSingleImageToCloudflare(
        file,
        "profile-picture"
      );
      profilePicture = imageUrl;
    }

    // Create UserDetails linked to the existing User
    const userDetails = new UserDetails({
      dob: parsedDob,
      gender,
      profilePicture: profilePicture,
      phoneNumber, 
       firstName, lastName, bio,
      userId: user._id,
    });

    const savedUserDetails = await userDetails.save();

    return res.status(201).json({
      status: 201,
      message: "User details onboarded successfully",
      userDetails: savedUserDetails,
    });
  } catch (error) {
    logger.error("Error during onboarding:", error);
    return res
      .status(500)
      .json({ status: 500, message: "An unexpected error occurred" });
  }
};

const updateUserDetails = async (req, res) => {
  const { dob, gender, phoneNumber, firstName, lastName, bio } = req.body; // Include phoneNumber
  const file = req.file;
   let profilePicture;
  // Validate phone number
  if (phoneNumber && !phoneNumberRegex.test(phoneNumber)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid phone number format",
      data: null,
    });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not found", data: null });
    }

    let userDetails = await UserDetails.findOne({ userId: req.user.id });
    if (!userDetails) {
      return res
        .status(404)
        .json({ status: 404, message: "User details not found", data: null });
    }
    if (file) {
      const imageUrl = await uploadSingleImageToCloudflare(
        file,
        "profile-picture"
      );
      profilePicture = imageUrl;
    }
    // Only process dob if it's provided in the request
    if (dob) {
      const [day, month, year] = dob.split("/");
      const parsedDob = new Date(`${year}-${month}-${day}`);
      userDetails.dob = parsedDob; // Update DOB only if provided
    }

    // Update other fields if they are provided
    userDetails.gender = gender || userDetails.gender;
    userDetails.profilePicture = profilePicture || userDetails.profilePicture;
    userDetails.phoneNumber = phoneNumber || userDetails.phoneNumber; 
    userDetails.firstName = firstName|| userDetails.firstName;
    userDetails.lastName = lastName || userDetails.lastName;
    userDetails.bio = bio || userDetails.bio;
    

    const updatedUserDetails = await userDetails.save();

    return res.status(200).json({
      status: 200,
      message: "User details updated successfully",
      userDetails: updatedUserDetails, user
    });
  } catch (error) {
    logger.error("Error updating user details:", error);
    return res.status(500).json({
      status: 500,
      message: "An unexpected error occurred",
      
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).sort({ createdAt: 1 });
    const userDetails = await UserDetails.findOne({ userId: req.user.id }).sort(
      { createdAt: 1 }
    );

    if (!userDetails) {
      return res
        .status(404)
        .json({ status: 404, message: "User details not found", data: null });
    }

    return res.status(200).json({
      status: 200,
      message: "User details retrieved successfully",
      data: {
        user,
        userDetails,
      },
    });
  } catch (error) {
    logger.error("Error fetching user details:", error);
    return res.status(500).json({
      status: 500,
      message: "An unexpected error occurred",
      data: null,
    });
  }
};



module.exports = { onboard, updateUserDetails, getUserDetails };

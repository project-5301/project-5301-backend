
const UserNotificationPreference = require("../models/userNotificationPreference");

// Function to handle adding user preferences
exports.addUserNotificationPreferences = async (req, res) => {
  const { language, profilePrivacy, interests } = req.body;
  const userId = req.user.id;
  try {
    let preferences = await UserNotificationPreference.findOne({ userId });
    if (preferences) {
      return res
        .status(400)
        .json({ message: "Preferences already exist for this user" });
    }

    preferences = new UserNotificationPreference({
      userId,
      language,
      profilePrivacy,
      interests,
    });

    await preferences.save();

    res.status(200).json({
      status: 200,
      message: "User preferences added successfully",
      preferences: [],
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      error: err.message,
    });
  }
};


exports.updateUserNotificationPreferences = async (req, res) => {
  const { language, profilePrivacy, notifications } = req.body;
  const userId = req.user.id; // Instead of req.params.userId

  // Define validation arrays
  const allowedPrivacySettings = ["public", "private"];

  // Validate request body
  if (profilePrivacy && !allowedPrivacySettings.includes(profilePrivacy)) {
    return res.status(400).json({
      status: 400,
      message: "Invalid profile privacy setting",
    });
  }

  // Validate notification settings if provided
  if (notifications) {
    const { general, email_alerts, notification_alerts } = notifications;

    if (general !== undefined && typeof general !== "boolean") {
      return res.status(400).json({
        status: 400,
        message: "General notification setting must be a boolean",
      });
    }

    if (email_alerts !== undefined && typeof email_alerts !== "boolean") {
      return res.status(400).json({
        status: 400,
        message: "Email alerts setting must be a boolean",
      });
    }

    if (
      notification_alerts !== undefined &&
      typeof notification_alerts !== "boolean"
    ) {
      return res.status(400).json({
        status: 400,
        message: "Notification alerts setting must be a boolean",
      });
    }
  }

  try {
    // Prepare update object with only provided fields
    const updateData = {};
    if (language !== undefined) updateData.language = language;
    if (profilePrivacy !== undefined) updateData.profilePrivacy = profilePrivacy;

    // Handle notification updates if provided
    if (notifications) {
      if (notifications.general !== undefined) {
        updateData["notifications.general"] = notifications.general;
      }
      if (notifications.email_alerts !== undefined) {
        updateData["notifications.email_alerts"] = notifications.email_alerts;
      }
      if (notifications.notification_alerts !== undefined) {
        updateData["notifications.notification_alerts"] =
          notifications.notification_alerts;
      }
    }

    updateData.updatedAt = Date.now();

    // Find and update user preferences
    const updatedPreferences = await UserNotificationPreference.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true } // Return the updated document and validate
    );

    if (!updatedPreferences) {
      // If preferences don't exist, create them
      const newPreferences = new UserNotificationPreference({
        userId,
        ...updateData,
        // Set default values for fields not in updateData
        language: updateData.language || "en",
        profilePrivacy: updateData.profilePrivacy || "private",
        notifications: {
          general:
            updateData["notifications.general"] !== undefined
              ? updateData["notifications.general"]
              : true,
          email_alerts:
            updateData["notifications.email_alerts"] !== undefined
              ? updateData["notifications.email_alerts"]
              : false,
          notification_alerts:
            updateData["notifications.notification_alerts"] !== undefined
              ? updateData["notifications.notification_alerts"]
              : false,
        },
      });

      await newPreferences.save();
      return res.status(201).json({
        status: 201,
        message: "User preferences created successfully",
        preferences: newPreferences,
      });
    }

    res.status(200).json({
      status: 200,
      message: "User preferences updated successfully",
      preferences: updatedPreferences,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 500,
      message: "Server error",
      error: err.message,
    });
  }
};


exports.getUserNotificationPreferences = async (req, res) => {
  //const { userId } = req.query; // Assuming userId is passed as a query parameter
  const userId =  req.query.userId || req.body.userId;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Find user preferences by userId
    const preferences = await UserNotificationPreference.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({ message: "User preferences not found" });
    }

    res.status(200).json({
      status: 200,
      message: "User preferences retrieved successfully",
      preferences,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ status: 500, error: err.message, message: "Server error" });
  }
};

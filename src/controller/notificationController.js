const Notification = require("../models/notification");
const NotificationRecipient = require("../models/notificationRecipients");
const User = require("../models/user");

const createNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, title, message, recipients } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ status: 404, message: "User not authorized to create notifications", data: null });
    }

    const notification = new Notification({ type, title, message });
    await notification.save();

    const recipientsPromises = recipients.map((userId) =>
      new NotificationRecipient({
        notificationId: notification._id,
        userId: userId,
        status: "sent",
      }).save()
    );

    await Promise.all(recipientsPromises);

    res.status(201).json({
      status:201,
      message: "Notification created successfully",
     data:{
      notificationId: notification._id,
      recipients,
     }
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err.message,
      data:null
    });
  }
};

const getNotificationsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const authUserId = req.user.id;

    // Check if the authenticated user is authorized to access the notifications
    if (userId !== authUserId) {
      return res
        .status(403)
        .json({status:403, message: "User not authorized to access these notifications",data:null });
    }

    // Query the notifications for the user, sorting by creation date (latest first)
    const notifications = await NotificationRecipient.find({
      userId,
    })
      .populate("notificationId")
      .sort({ "notificationId.createdAt": -1 }) // Sort by createdAt in descending order
      .exec();

    // Check if any notifications are found
    if (!notifications.length) {
      return res.status(404).json({
        status: "error",
        message: "No notifications found for this user",
        data: [],
      });
    }

    // Map notifications to a format convenient for Flutter devs
    const notificationData = notifications.map((recipient) => ({
      notificationId: recipient.notificationId._id,
      title: recipient.notificationId.title,
      message: recipient.notificationId.message,
      status: recipient.status,
      createdAt: recipient.notificationId.createdAt,
      readAt: recipient.readAt,
    }));

    // Respond with the notifications array
    res.status(200).json({
      status: "200",
      message: "Notifications retrieved successfully",
      data: notificationData,
    });
  } catch (err) {
    // Handle any errors during the process
    res.status(500).json({
      status: 500,
      message: "An unexpected error occurred while retrieving notifications",
      data: [],
    });
  }
};


const updateNotificationStatus = async (req, res) => {
  try {
    const { notificationId, userId } = req.params;
    const { status } = req.body;
    const authUserId = req.user.id;
    if (userId !== authUserId) {
      return res
      .status(403)
      .json({ status: 403, message: "User not authorized to update this notification", data: null });
    }

    const update = { status };
    if (status === "read") {
      update.readAt = Date.now();
    }

    await NotificationRecipient.findOneAndUpdate(
      { notificationId, userId },
      update,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 200,
      message: "Notification status updated successfully",
      data: null,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: "An unexpected error occurred while updating the notification status",
      data: null,
    });
  }
};

module.exports = {
  createNotification,
  getNotificationsForUser,
  updateNotificationStatus,
};

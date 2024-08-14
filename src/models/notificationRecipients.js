const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationRecipientsSchema = new Schema({
  notificationId: {
    type: Schema.Types.ObjectId,
    ref: "Notification",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read", "failed"],
    default: "sent",
  },
  readAt: {
    type: Date,
  },
});

const NotificationRecipient = mongoose.model(
  "NotificationRecipient",
  notificationRecipientsSchema
);

module.exports = NotificationRecipient;

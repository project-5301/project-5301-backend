const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./user');

const UserNotificationPreferenceSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true  // This ensures one preference per user
  },
  language: {
    type: Schema.Types.String,
    required: false
  },
  profilePrivacy: {
    type: Schema.Types.String,
    required: false,
    enum: ['public', 'private'],
    default: 'private'
  },
  notifications: {
    general: {
      type: Boolean,
      default: true
    },
    email_alerts: {
      type: Boolean,
      default: false
    },
    notification_alerts: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

const UserNotificationPreference = mongoose.model('UserNotificationPreference', UserNotificationPreferenceSchema);

module.exports = UserNotificationPreference;
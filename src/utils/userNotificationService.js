const Notification = require('../models/notification');
const User = require('../models/user');
const UserNotificationPreference = require('../models/userNotificationPreference');
const { sendFcmNotification } = require('../config/firebaseAdmin');
const sendEmail  = require('./sendEmail');
const { mjml2html } = require("../utils/email-template");
const path = require('path');

/**
 * Creates and sends notifications based on recipient preferences
 * @param {Object} options
 * @param {string} options.recipientId - User ID to receive the notification
 * @param {string} options.title - Notification title/subject for email
 * @param {string} options.message - Notification content
 * @param {string} options.type - Notification type (for DB: "info", "warning", "success", "error", "chat")
 * @param {string} options.senderId - Optional User ID that triggered notification
 * @param {Object} options.metadata - Optional additional data
 * @param {boolean} options.forceEmail - Force send email regardless of preferences
 * @param {boolean} options.customEmail - Indicates message contains HTML for email
 */
const handleNotification = async (options) => {
  try {
    const { 
      recipientId, 
      title,
      message, 
      type, 
      senderId = null,
      metadata = {},
      forceEmail = false,
      customEmail = false,
      skipEmail = false
    } = options;

    // Get recipient
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.warn(`User ${recipientId} not found, cannot send notification`);
      return { success: false, reason: "User not found" };
    }
    
    // Get recipient email
    const recipientEmail = recipient.email; // Match with your user model
    
    // Get FCM token if available
    const fcmToken = recipient.fcmToken;

    // Get user notification preferences
    let preferences = {
      general: true,
      email_alerts: false,
      notification_alerts: false
    };

    // Find user preferences, create default if not found
    let userNotificationPreference = await UserNotificationPreference.findOne({ userId: recipientId });
    
    if (!userNotificationPreference) {
      // Create default preferences if not found
      userNotificationPreference = new UserNotificationPreference({
        userId: recipientId,
        notifications: preferences
      });
      await userNotificationPreference.save();
    } else if (userNotificationPreference.notifications) {
      preferences = userNotificationPreference.notifications;
    }

    const results = {
      database: false,
      email: false,
      fcm: false
    };

    // For database notification, we need a plain text version if message is HTML
    const plainTextMessage = customEmail ? 
      `New activity on your account.` : 
      message;

    // Convert notification type to one of the valid types in the Notification model
    // Valid types in your schema are: "info", "warning", "success", "error", "chat"
    let notificationType = "info"; // Default type
    switch (type) {
      case 'registration':
        notificationType = "success";
        break;
      case 'login':
        notificationType = "info";
        break;
      case 'password_reset':
        notificationType = "warning";
        break;
      default:
        notificationType = "info";
        break;
    }

    // Determine which notification channels to use based on type and preferences
    let shouldStoreInDatabase = false;
    let shouldSendEmail = false;
    let shouldSendFCM = false;

    // Check notification type and apply preferences
    switch (type) {
      case 'registration':
        // Registration notifications are always stored and emails are always sent
        shouldStoreInDatabase = true;
        shouldSendEmail = true; // Force email for registration
        shouldSendFCM = preferences.notification_alerts && fcmToken;
        break;
      
      case 'login':
        // Login notifications follow notification_alerts preference
        shouldStoreInDatabase = preferences.notification_alerts;
        shouldSendEmail = preferences.email_alerts || forceEmail;
        shouldSendFCM = preferences.notification_alerts && fcmToken;
        break;
      
      default:
        // General notifications follow general preference
        shouldStoreInDatabase = preferences.general;
        shouldSendEmail = preferences.email_alerts || forceEmail;
        shouldSendFCM = preferences.notification_alerts && fcmToken;
        break;
    }

    // 1. Store notification in database if needed
    if (shouldStoreInDatabase) {
      const notification = new Notification({
        userId: recipientId,
        title,
        message: plainTextMessage,
        type: notificationType, // Use the converted notification type
        isRead: false,
        metadata
      });
      
      await notification.save();
      console.info(`Notification created in database for user ${recipientId}`);
      results.database = true;
    }

    // 2. Send email if needed
    if (!skipEmail && shouldSendEmail && recipientEmail) {
      try {
        // Matches your email function's parameter order
        await sendEmail(
            title, // subject
            recipientEmail, // recipient email
            customEmail ? message : plainTextMessage // body
          );
        console.info(`Email notification sent to ${recipientEmail}`);
        results.email = true;
      } catch (error) {
        console.error(`Failed to send email notification:`, error);
      }
    }

    // 3. Send FCM push notification if needed
    if (shouldSendFCM && fcmToken) {
      try {
        // Use the imported sendFcmNotification function
        const fcmResponse = await sendFcmNotification(
          fcmToken,
          title,
          plainTextMessage,
          {
            notificationType: type,
            ...metadata
          }
        );
        
        console.info(`FCM notification sent successfully to user ${recipientId}. Type: ${type}, Title: "${title}"`);
        results.fcm = true;
      } catch (error) {
        console.error(`Failed to send FCM notification to user ${recipientId}:`, error);
      }
    }

    return { 
      success: results.database || results.email || results.fcm,
      results
    };
  } catch (error) {
    console.error("Error handling notification:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome notification on registration
 * This notification is always sent regardless of user preferences
 */
const sendWelcomeNotification = async (userId, userName) => {
  try {
    // First, create the database notification and only send FCM notification
    const notificationResult = await handleNotification({
      recipientId: userId,
      title: "Welcome to Our Platform",
      message: `Hello ${userName}, welcome to our platform! Your account has been successfully registered.`,
      type: "registration",
      metadata: {
        registrationDate: new Date()
      },
      forceEmail: false, // Force this to false to prevent email here
      skipEmail: true
    });
  
    // Then send only the formatted welcome email using MJML template
    try {
      const user = await User.findById(userId);
      if (!user || !user.email) return notificationResult;
  
      // Prepare data for MJML template
      const templateData = {
        userName: userName || 'User',
        registrationDate: new Date().toLocaleDateString(),
        platformName: 'Our Platform',
        currentYear: new Date().getFullYear() // Add current year for footer
      };
  
      // Process MJML template
      try {
        console.debug('Looking for template: welcome-template');
        
        const emailOutput = mjml2html('welcome-template', templateData);
        console.debug('MJML processing successful:', !!emailOutput.html);

        // Send email notification
        const subject = "Welcome to Our Platform";
        const recipientEmail = user.email;
      
        await sendEmail(subject, recipientEmail, emailOutput.html);
        console.info(`Welcome email sent to ${recipientEmail}`);
      } catch (mjmlError) {
        // Fallback to simple HTML if MJML template fails
        console.error('Error processing MJML template:', mjmlError);
        
        const fallbackHtml = `
          <h1>Welcome to Our Platform!</h1>
          <p>Hello ${userName},</p>
          <p>Thank you for joining us. We're excited to have you on board!</p>
          <p>Registration Date: ${new Date().toLocaleDateString()}</p>
        `;
        
        await sendEmail("Welcome to Our Platform", user.email, fallbackHtml);
      }
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  
    return notificationResult;
  } catch (error) {
    console.error('Error in sendWelcomeNotification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send login detected notification
 * This notification respects user preferences
 */
const sendLoginNotification = async (userId, userName, deviceInfo, ipAddress, forceEmail = false) => {
  try {
    const loginTime = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    
    // Get user preferences before sending notification to log FCM eligibility
    const userPrefs = await UserNotificationPreference.findOne({ userId });
    const notificationAlertsEnabled = userPrefs?.notifications?.notification_alerts || false;
    
    // Get user to check for FCM token
    const user = await User.findById(userId);
    const hasFcmToken = !!user?.fcmToken;
    
    console.debug(`Login notification for user ${userId}: notification_alerts=${notificationAlertsEnabled}, has FCM token=${hasFcmToken}`);
    
    // Send in-app notification with basic message - but don't send the email here
    const message = `Hello ${userName}, we detected a new login to your account on ${loginTime}. If this wasn't you, please secure your account immediately.`;
    
    const notificationResult = await handleNotification({
      recipientId: userId,
      title: "New Login Detected",
      message,
      type: "login",
      metadata: {
        loginTime: new Date(),
        deviceInfo,
        ipAddress
      },
      forceEmail: false, // Set this to false to avoid email from handleNotification
      skipEmail: true
    });

    // Log the detailed results of the notification attempt
    console.debug(`Login notification results for user ${userId}: ${JSON.stringify(notificationResult.results)}`);
    
    // Check if FCM should have been sent but failed
    if (notificationAlertsEnabled && hasFcmToken && !notificationResult.results.fcm) {
      console.warn(`FCM notification failed for user ${userId} despite being eligible (notification_alerts=true, FCM token exists)`);
    }

    // Check if email alerts are enabled
    try {
      // We already got user preferences above
      const shouldSendEmail = userPrefs?.notifications?.email_alerts || forceEmail;
      
      // If email alerts are enabled, send formatted email
      if (shouldSendEmail) {
        // We already have the user from above
        if (!user || !user.email) return notificationResult;
    
        // Prepare data for MJML template
        const templateData = {
          userName: userName || 'User',
          loginTime: loginTime,
          ipAddress: ipAddress || 'Unknown',
          userAgent: deviceInfo || 'Unknown device',
          loginLocation: 'Unknown location', // Optional: use geolocation service if available
          currentYear: new Date().getFullYear() // Add current year for footer
        };
    
        try {
          // Process MJML template
          const emailOutput = mjml2html('login-detection-template', templateData);
      
          // Send email notification
          const subject = "New Login Detected";
          const recipientEmail = user.email;
      
          await sendEmail(subject, recipientEmail, emailOutput.html);
          console.info(`Login detection email sent to ${recipientEmail}`);
        } catch (mjmlError) {
          // Fallback to simple HTML if MJML template fails
          console.error('Error processing MJML template:', mjmlError);
          
          const fallbackHtml = `
            <h1>New Login Detected</h1>
            <p>Hello ${userName},</p>
            <p>We detected a new login to your account on ${loginTime}.</p>
            <p>Device: ${deviceInfo || 'Unknown'}</p>
            <p>IP Address: ${ipAddress || 'Unknown'}</p>
            <p>If this wasn't you, please secure your account immediately.</p>
          `;
          
          await sendEmail("New Login Detected", user.email, fallbackHtml);
        }
      }
    } catch (error) {
      console.error('Error sending login email notification:', error);
    }

    return notificationResult;
  } catch (error) {
    console.error('Error in sendLoginNotification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Create default notification preferences for a new user
 */
const createDefaultUserNotificationPreferences = async (userId) => {
  try {
    const existingPrefs = await UserNotificationPreference.findOne({ userId });
    
    if (!existingPrefs) {
      const defaultPreferences = new UserNotificationPreference({
        userId,
        notifications: {
          general: true,
          email_alerts: false,
          notification_alerts: false
        }
      });
      
      await defaultPreferences.save();
      console.info(`Created default notification preferences for user ${userId}`);
      return defaultPreferences;
    }
    
    return existingPrefs;
  } catch (error) {
    console.error("Error creating default user preferences:", error);
    throw error;
  }
};

// Export all functions
module.exports = {
  handleNotification,
  sendWelcomeNotification,
  sendLoginNotification,
  createDefaultUserNotificationPreferences
};
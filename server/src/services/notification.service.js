const { Notification, Follower } = require('../models');

/**
 * Create a single in-database notification
 */
const createNotification = async ({ recipient, type, title, message, complaint }) => {
  try {
    return await Notification.create({
      recipient,
      type,
      title,
      message,
      complaint: complaint || null,
      isRead: false,
    });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

/**
 * Notify all followers and creator of a complaint regarding status changes or comments
 */
const notifyFollowersAndCreator = async ({ complaint, type, title, message, excludeUserId }) => {
  try {
    const recipients = new Set();

    // Add creator if not the one performing action
    if (complaint.createdBy && complaint.createdBy.toString() !== excludeUserId?.toString()) {
      recipients.add(complaint.createdBy.toString());
    }

    // Add assigned officer if not the one performing action
    if (complaint.assignedOfficer && complaint.assignedOfficer.toString() !== excludeUserId?.toString()) {
      recipients.add(complaint.assignedOfficer.toString());
    }

    // Add all followers
    const followers = await Follower.find({ complaint: complaint._id });
    followers.forEach((f) => {
      if (f.user.toString() !== excludeUserId?.toString()) {
        recipients.add(f.user.toString());
      }
    });

    const notificationsToInsert = Array.from(recipients).map((recipientId) => ({
      recipient: recipientId,
      type,
      title,
      message,
      complaint: complaint._id,
      isRead: false,
      createdAt: new Date(),
    }));

    if (notificationsToInsert.length > 0) {
      await Notification.insertMany(notificationsToInsert);
    }
  } catch (err) {
    console.error('Failed to notify followers:', err.message);
  }
};

const getUserNotifications = async (userId) => {
  return Notification.find({ recipient: userId })
    .populate('complaint', 'complaintNumber title status')
    .sort({ createdAt: -1 })
    .limit(50);
};

const markNotificationRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );
};

const markAllNotificationsRead = async (userId) => {
  const result = await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
  return { modifiedCount: result.modifiedCount };
};

module.exports = {
  createNotification,
  notifyFollowersAndCreator,
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};

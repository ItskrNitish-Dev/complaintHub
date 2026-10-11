const notificationService = require('../services/notification.service');
const { successResponse } = require('../utils/apiResponse');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user._id);
    return successResponse(res, 200, 'Notifications retrieved', notifications);
  } catch (error) {
    next(error);
  }
};

const markRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markNotificationRead(
      req.params.id,
      req.user._id
    );
    return successResponse(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllNotificationsRead(req.user._id);
    return successResponse(res, 200, 'All notifications marked as read', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};

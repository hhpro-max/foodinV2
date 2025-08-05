const NotificationService = require('../services/notification.service');

class NotificationController {
  constructor(sequelize) {
    this.notificationService = new NotificationService(sequelize);
  }

  async sendNotification(req, res, next) {
    try {
      const { userId, type, message, relatedId } = req.body;
      const notification = await this.notificationService.sendNotification(userId, type, message, relatedId);
      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const updatedNotification = await this.notificationService.markNotificationAsRead(notificationId);
      res.status(200).json(updatedNotification);
    } catch (error) {
      next(error);
    }
  }

  async getUserNotifications(req, res, next) {
    try {
      const { userId } = req.params;
      const notifications = await this.notificationService.getUserNotifications(userId);
      res.status(200).json(notifications);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;

const NotificationRepository = require('../repositories/notification.repository');

class NotificationService {
  constructor(sequelize) {
    this.notificationRepository = new NotificationRepository(sequelize);
  }

  async sendNotification(userId, type, message, relatedId = null) {
    return this.notificationRepository.create({
      user_id: userId,
      type,
      message,
      related_id: relatedId,
    });
  }

  async markNotificationAsRead(notificationId) {
    return this.notificationRepository.markAsRead(notificationId);
  }

  async getUserNotifications(userId) {
    return this.notificationRepository.findByUser(userId);
  }
}

module.exports = NotificationService;

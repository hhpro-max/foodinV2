const Notification = require('../models/notification.model');

class NotificationRepository {
  async findByUser(userId) {
    return await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async markAsRead(notificationId) {
    await Notification.update(
      { isRead: true },
      { where: { id: notificationId } }
    );
  }
}

module.exports = NotificationRepository;

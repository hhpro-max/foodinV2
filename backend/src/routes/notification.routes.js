const express = require('express');
const NotificationController = require('../controllers/notification.controller');
const { validateParams, commonSchemas } = require('../middlewares/validateRequest');

const router = express.Router();

module.exports = (sequelize) => {
  const notificationController = new NotificationController(sequelize);

  router.post('/send', (req, res, next) => notificationController.sendNotification(req, res, next));
  router.patch('/:notificationId/read',
    validateParams(commonSchemas.notificationId),
    (req, res, next) => notificationController.markAsRead(req, res, next)
  );
  router.get('/:userId',
    validateParams(commonSchemas.userId),
    (req, res, next) => notificationController.getUserNotifications(req, res, next)
  );

  return router;
};

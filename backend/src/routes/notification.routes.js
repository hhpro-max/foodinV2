const express = require('express');
const NotificationController = require('../controllers/notification.controller');
const { validateParams, commonSchemas } = require('../middlewares/validateRequest');

const router = express.Router();

module.exports = (sequelize) => {
  const notificationController = new NotificationController(sequelize);

  /**
   * @swagger
   * /notifications/send:
   *   post:
   *     summary: Send a notification
   *     tags: [Notifications]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Notification'
   *     responses:
   *       200:
   *         description: Notification sent successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Notification'
   *       400:
   *         description: Validation error
   *       500:
   *         description: Server error
   */
  router.post('/send', (req, res, next) => notificationController.sendNotification(req, res, next));

  /**
   * @swagger
   * /notifications/{notificationId}/read:
   *   patch:
   *     summary: Mark a notification as read
   *     tags: [Notifications]
   *     parameters:
   *       - in: path
   *         name: notificationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Notification ID
   *     responses:
   *       200:
   *         description: Notification marked as read
   *       400:
   *         description: Validation error
   *       404:
   *         description: Notification not found
   *       500:
   *         description: Server error
   */
  router.patch('/:notificationId/read',
    validateParams(commonSchemas.notificationId),
    (req, res, next) => notificationController.markAsRead(req, res, next)
  );

  /**
   * @swagger
   * /notifications/{userId}:
   *   get:
   *     summary: Get notifications for a user
   *     tags: [Notifications]
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: User ID
   *     responses:
   *       200:
   *         description: List of notifications
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Notification'
   *       400:
   *         description: Validation error
   *       404:
   *         description: User not found
   *       500:
   *         description: Server error
   */
  router.get('/:userId',
    validateParams(commonSchemas.userId),
    (req, res, next) => notificationController.getUserNotifications(req, res, next)
  );

  return router;
};

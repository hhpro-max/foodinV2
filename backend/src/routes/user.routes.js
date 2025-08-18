const express = require('express');
const userController = require('../controllers/user.controller');
const { validateRequest, validateParams, commonSchemas } = require('../middlewares/validateRequest');
const auth = require('../middlewares/auth');
const {
  updateProfileSchema,
  completeProfileSchema,
  assignRoleSchema,
  chooseRoleSchema
} = require('../validations/user.validation');

const router = express.Router();

// Routes that require authentication (including inactive users)
router.post('/profile/complete', auth.authenticateInactive, validateRequest(completeProfileSchema), userController.completeProfile);

// Protected routes (authentication required for active users only)
router.use(auth.authenticate); // Apply authentication middleware to all routes below

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and authentication
 */

// Protected routes (authentication required)
// router.use(auth.authenticate); // Apply authentication middleware to all routes below

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/profile', userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_type:
 *                 type: string
 *                 enum: [natural, legal]
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               national_id:
 *                 type: string
 *               economic_code:
 *                 type: string
 *               company_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/profile', validateRequest(updateProfileSchema), userController.updateProfile);

/**
 * @swagger
 * /users/profile/complete:
 *   post:
 *     summary: Complete user profile and activate user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_type:
 *                 type: string
 *                 enum: [natural, legal]
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               national_id:
 *                 type: string
 *               economic_code:
 *                 type: string
 *               company_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile completed and user activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Profile completed and user activated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
// This route is already defined above with the authenticateInactive middleware
// router.post('/profile/complete', validateRequest(completeProfileSchema), userController.completeProfile);

/**
 * @swagger
 * /users/permissions:
 *   get:
 *     summary: Get user permissions
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["read_users", "write_users"]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/permissions', userController.getUserPermissions);

/**
 * @swagger
 * /users/choose-role:
 *   post:
 *     summary: Choose a role for the user (customer or seller)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChooseRole'
 *     responses:
 *       200:
 *         description: Role chosen successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Role chosen successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.post('/choose-role', validateRequest(chooseRoleSchema), userController.chooseRole);

// Admin only routes

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', auth.checkPermission('user.view'),userController.getAllUsers);

 /**
  * @swagger
  * /users/roles:
  *   get:
  *     summary: Get all roles (Admin only)
  *     tags: [Users]
  *     security:
  *       - bearerAuth: []
  *     responses:
  *       200:
  *         description: Roles retrieved successfully
  *         content:
  *           application/json:
  *             schema:
  *               type: object
  *               properties:
  *                 status:
  *                   type: string
  *                   example: "success"
  *                 data:
  *                   type: array
  *                   items:
  *                     $ref: '#/components/schemas/Role'
  *       401:
  *         description: Unauthorized
  *       403:
  *         description: Forbidden - Admin access required
  *       500:
  *         description: Server error
  */
 router.get('/roles', auth.checkPermission('user.view'), userController.getAllRoles);

 /**
  * @swagger
 * /users/{userId}/roles:
 *   post:
 *     summary: Assign a role to a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: Role ID to assign
 *     responses:
 *       200:
 *         description: Role assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Role assigned successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User or Role not found
 *       500:
 *         description: Server error
 */
router.post('/:userId/roles',
  auth.checkPermission('user.manage_roles'),
  validateParams(commonSchemas.userId),
  validateRequest(assignRoleSchema),
  userController.assignRole
);

/**
 * @swagger
 * /users/{userId}/roles:
 *   delete:
 *     summary: Remove a role from a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: string
 *                 format: uuid
 *                 description: Role ID to remove
 *     responses:
 *       200:
 *         description: Role removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Role removed successfully"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User or Role not found
 *       500:
 *         description: Server error
 */
router.delete('/:userId/roles',
  auth.checkPermission('user.manage_roles'),
  validateParams(commonSchemas.userId),
  validateRequest(assignRoleSchema),
  userController.removeRole
);

/**
 * @swagger
 * /users/{userId}/deactivate:
 *   patch:
 *     summary: Deactivate a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "User deactivated successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/:userId/deactivate',
  auth.checkPermission('user.update'),
  validateParams(commonSchemas.userId),
  userController.deactivateUser
);

/**
 * @swagger
 * /users/{userId}/activate:
 *   patch:
 *     summary: Activate a user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *         description: User activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "User activated successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.patch('/:userId/activate',
  auth.checkPermission('user.update'),
  validateParams(commonSchemas.userId),
  userController.activateUser
);

module.exports = router;
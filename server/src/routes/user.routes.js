const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

// Current user profile routes
router.get('/me', protect, userController.getMyProfile);
router.patch('/me', protect, userController.updateMyProfile);

// Admin-only user management routes
router.use(protect, authorize(ROLES.ADMIN));
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.patch('/:id/role', userController.updateUserRole);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;

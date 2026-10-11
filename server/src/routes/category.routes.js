const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only modification routes
router.post('/', protect, authorize(ROLES.ADMIN), categoryController.createCategory);
router.patch('/:id', protect, authorize(ROLES.ADMIN), categoryController.updateCategory);
router.delete('/:id', protect, authorize(ROLES.ADMIN), categoryController.deleteCategory);

module.exports = router;

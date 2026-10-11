const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { ROLES } = require('../constants/roles');

router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Admin-only modification routes
router.post('/', protect, authorize(ROLES.ADMIN), departmentController.createDepartment);
router.patch('/:id', protect, authorize(ROLES.ADMIN), departmentController.updateDepartment);
router.delete('/:id', protect, authorize(ROLES.ADMIN), departmentController.deleteDepartment);

module.exports = router;

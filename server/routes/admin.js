const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(isAuthenticated, authorizeRoles('admin'));

// Validation middleware
const validateRoleUpdate = [
    body('role').notEmpty().withMessage('Role is required')
];

// Admin routes
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/role', validateRoleUpdate, adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router; 
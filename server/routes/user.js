const express = require('express');
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(isAuthenticated);

// User routes
router.get('/dashboard', userController.getDashboard);
router.put('/profile', userController.updateProfile);

module.exports = router; 
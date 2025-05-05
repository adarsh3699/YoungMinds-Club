const express = require('express');
const organizerController = require('../controllers/organizerController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and organizer role check to all routes
router.use(isAuthenticated, authorizeRoles('organizer', 'admin'));

// Organizer routes
router.get('/dashboard', organizerController.getDashboard);
router.get('/events', organizerController.getEvents);

module.exports = router; 
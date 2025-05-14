const express = require('express');
const { isAuthenticated } = require('../middlewares/auth');
const userController = require('../controllers/userController');
const userActivityController = require('../controllers/userActivityController');
const announcementController = require('../controllers/announcementController');

const router = express.Router();

// User profile routes
router.get('/profile', isAuthenticated, userController.getDashboard);
router.put('/profile', isAuthenticated, userController.updateProfile);

// User activity routes
router.get('/dashboard', isAuthenticated, userActivityController.getUserProfile);
router.get('/events', isAuthenticated, userActivityController.getUserEvents);
router.get('/events/saved', isAuthenticated, userActivityController.getSavedEvents);
router.get('/events/registered', isAuthenticated, userActivityController.getRegisteredEvents);
router.get('/leaderboard', isAuthenticated, userActivityController.getLeaderboard);

// User announcements route
router.get('/announcements', isAuthenticated, announcementController.getActiveAnnouncements);

module.exports = router; 
const express = require('express');
const { isAuthenticated } = require('../middlewares/auth');
const userController = require('../controllers/userController');
const userActivityController = require('../controllers/userActivityController');
const announcementController = require('../controllers/announcementController');

const router = express.Router();

// User profile routes
router.get('/profile', isAuthenticated, userController.getDashboard);
router.put('/profile', isAuthenticated, userController.updateProfile);
router.post('/profile/picture', isAuthenticated, userController.uploadProfilePicture);

// User activity routes
router.get('/dashboard', isAuthenticated, userActivityController.getUserProfile);
router.get('/events', isAuthenticated, userActivityController.getUserEvents);
router.get('/events/registered', isAuthenticated, userActivityController.getRegisteredEvents);
router.get('/leaderboard', isAuthenticated, userActivityController.getLeaderboard);
router.get('/xp-history', isAuthenticated, userActivityController.getXPHistory);
router.get('/badges', isAuthenticated, userActivityController.getUserBadges);

// User announcements route
router.get('/announcements', isAuthenticated, announcementController.getActiveAnnouncements);
router.get('/notifications', isAuthenticated, announcementController.getUserNotifications);

module.exports = router; 
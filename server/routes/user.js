const express = require('express');
const { isAuthenticated } = require('../middlewares/auth');
const { handleMulterError } = require('../middlewares/otherUtils');
const userController = require('../controllers/userController');
const userActivityController = require('../controllers/userActivityController');
const announcementController = require('../controllers/announcementController');

const router = express.Router();

// Apply authentication to all routes
router.use(isAuthenticated);

// User profile routes
router.get('/profile', userController.getDashboard);
router.put('/profile', userController.updateProfile);
router.post('/profile/picture', handleMulterError, userController.uploadProfilePicture);

// User activity routes
router.get('/dashboard', userActivityController.getUserProfile);
router.get('/events', userActivityController.getUserEvents);
router.get('/events/registered', userActivityController.getRegisteredEvents);
router.get('/leaderboard', userActivityController.getLeaderboard);
router.get('/xp-history', userActivityController.getXPHistory);
router.get('/badges', userActivityController.getUserBadges);

// User announcements route
router.get('/announcements', announcementController.getActiveAnnouncements);
router.get('/notifications', announcementController.getUserNotifications);

module.exports = router;

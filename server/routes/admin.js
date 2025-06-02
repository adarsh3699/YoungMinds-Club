const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(isAuthenticated, authorizeRoles('admin'));

// Admin profile routes
router.get('/profile', adminController.getAdminProfile);
router.post('/profile/picture', upload.single('profilePicture'), adminController.uploadProfilePicture);
router.put('/profile', adminController.updateAdminProfile);

// Admin logs route
router.get('/logs', adminController.getAdminLogs);

// Admin team route
router.get('/team', adminController.getAdminTeam);

// Dashboard and analytics routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);
router.get('/flagged-content', adminController.getFlaggedContent);

// User management routes
router.get('/users', adminController.getAllUsers);
router.get('/active-users', adminController.getActiveUsers);
router.get('/users/:id', adminController.getUser);
router.put('/users/:id/role', 
    [body('role').notEmpty().withMessage('Role is required')], 
    adminController.updateUserRole
);
router.put('/users/:id/status', 
    [body('status').notEmpty().withMessage('Status is required')], 
    adminController.updateUserStatus
);
router.put('/users/:id/flag', 
    [body('isFlagged').isBoolean().withMessage('isFlagged must be a boolean')], 
    adminController.toggleUserFlag
);
router.delete('/users/:id', adminController.deleteUser);

// Organizer management routes
router.get('/organizers', adminController.getAllOrganizers);
router.get('/top-organizers', adminController.getTopOrganizers);

// Event management routes
router.get('/events', adminController.getAllEvents);
router.put('/events/:id', upload.single('poster'), adminController.updateEvent);
router.put('/events/:id/flag', 
    [body('isFlagged').isBoolean().withMessage('isFlagged must be a boolean')], 
    adminController.toggleEventFlag
);
router.delete('/events/:id', adminController.deleteEvent);

// Moderation routes
router.get('/moderation/flagged', adminController.getFlaggedItems);

// Announcement routes
router.post('/announcements', 
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('message').notEmpty().withMessage('Message is required')
    ], 
    adminController.createAnnouncement
);
router.get('/announcements', adminController.getAnnouncements);
router.put('/announcements/:id', 
    [body('isActive').isBoolean().withMessage('isActive must be a boolean')], 
    adminController.updateAnnouncementStatus
);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

module.exports = router; 
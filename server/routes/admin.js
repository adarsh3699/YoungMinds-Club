const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(isAuthenticated, authorizeRoles('admin'));

// Dashboard and analytics routes
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/analytics', adminController.getAnalytics);

// User management routes
router.get('/users', adminController.getAllUsers);
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

// Event management routes
router.get('/events', adminController.getAllEvents);
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
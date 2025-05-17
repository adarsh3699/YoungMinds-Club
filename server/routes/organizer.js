const express = require('express');
const organizerController = require('../controllers/organizerController');
const { isAuthenticated, authorizeRoles } = require('../middlewares/auth');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Apply authentication and organizer role check to all routes
router.use(isAuthenticated, authorizeRoles('organizer', 'admin'));

// Profile routes
router.get('/profile', organizerController.getProfile);
router.put('/profile', organizerController.updateProfile);
router.post('/profile/picture', upload.single('profilePicture'), organizerController.uploadProfilePicture);

// Dashboard routes
router.get('/dashboard', organizerController.getDashboard);
router.get('/feedback/summary', organizerController.getFeedbackSummary);

// Event management routes
router.get('/events', organizerController.getEvents);
router.post('/events', upload.single('poster'), organizerController.createEvent);
router.get('/events/:id', organizerController.getEventDetails);
router.put('/events/:id', upload.single('poster'), organizerController.updateEvent);
router.delete('/events/:id', organizerController.deleteEvent);

// Attendee management
router.get('/events/:id/attendees', organizerController.getEventAttendees);

module.exports = router; 
const express = require('express');
const { isAuthenticated, authorizeRoles, optionalAuth } = require('../middlewares/auth');
const eventController = require('../controllers/eventController');

const router = express.Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/recommended', isAuthenticated, eventController.getRecommendedEvents);
router.get('/:id', optionalAuth, eventController.getEventById);

// Protected routes
router.post('/', isAuthenticated, authorizeRoles(['organizer', 'admin']), eventController.createEvent);
router.post('/:eventId/register', isAuthenticated, eventController.registerForEvent);
router.post('/:eventId/save', isAuthenticated, eventController.saveEvent);
router.post('/:eventId/feedback', isAuthenticated, eventController.submitFeedback);

module.exports = router; 
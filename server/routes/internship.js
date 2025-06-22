const express = require('express');
const { isAuthenticated, authorizeRoles, optionalAuth } = require('../middlewares/auth');
const internshipController = require('../controllers/internshipController');

const router = express.Router();

// Public routes
router.get('/', internshipController.getAllInternships);
router.get('/:id', optionalAuth, internshipController.getInternshipById);

// Protected routes
router.post('/', isAuthenticated, authorizeRoles(['organizer', 'admin']), internshipController.createInternship);
router.post('/:internshipId/apply', isAuthenticated, internshipController.applyForInternship);
router.post('/:internshipId/save', isAuthenticated, internshipController.saveInternship);

module.exports = router; 
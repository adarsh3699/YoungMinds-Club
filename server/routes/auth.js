const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middlewares/auth');
const { getGoogleAuthURL } = require('../config/google');

const router = express.Router();

// Validation middleware
const validateSignup = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
    body('email').trim().isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Auth routes
router.post('/signup', validateSignup, authController.signup);
router.post('/login', validateLogin, authController.login);
router.get('/me', isAuthenticated, authController.getCurrentUser);
router.get('/logout', authController.logout);

// Google OAuth routes
router.get('/google', (req, res) => {
    const googleAuthURL = getGoogleAuthURL();
    res.redirect(googleAuthURL);
});

router.get('/google/callback', authController.googleCallback);

router.get('/google/failure', (req, res) => {
    res.status(401).json({
        success: false,
        message: 'Google authentication failed'
    });
});

module.exports = router; 
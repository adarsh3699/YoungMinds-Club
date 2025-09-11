const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { isAuthenticated } = require("../middlewares/auth");
const { getGoogleAuthURL } = require("../config/google");
const { passwordResetLimiter, authLimiter, signupLimiter } = require("../middlewares/rateLimiting");

const router = express.Router();

// Validation middleware
const validateSignup = [
	body("name").trim().notEmpty().withMessage("Name is required"),
	body("email").trim().isEmail().withMessage("Please enter a valid email"),
	body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];

const validateLogin = [
	body("email").trim().isEmail().withMessage("Please enter a valid email"),
	body("password").notEmpty().withMessage("Password is required"),
];

const validateForgotPassword = [body("email").trim().isEmail().withMessage("Please enter a valid email")];

const validateResetPassword = [
	body("token").notEmpty().withMessage("Reset token is required"),
	body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
];

// Auth routes with rate limiting
router.post("/signup", signupLimiter, validateSignup, authController.signup);
router.post("/login", authLimiter, validateLogin, authController.login);
router.get("/me", isAuthenticated, authController.getCurrentUser);
router.get("/logout", authController.logout);

// Password reset routes with rate limiting
router.post("/forgot-password", passwordResetLimiter, validateForgotPassword, authController.forgotPassword);
router.post("/reset-password", validateResetPassword, authController.resetPassword);

// Google OAuth routes
router.get("/google", (req, res) => {
	const googleAuthURL = getGoogleAuthURL();
	res.redirect(googleAuthURL);
});

router.get("/google/callback", authController.googleCallback);

router.get("/google/failure", (req, res) => {
	res.status(401).json({
		success: false,
		message: "Google authentication failed",
	});
});

module.exports = router;

const rateLimit = require("express-rate-limit");

// Rate limiter for password reset requests
const passwordResetLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 3, // Limit each IP to 3 password reset requests per windowMs
	message: {
		success: false,
		message: "Too many password reset requests. Please try again in 15 minutes.",
		retryAfter: 15 * 60, // seconds until next attempt allowed
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// Custom key generator to combine IP and email for more targeted limiting
	keyGenerator: (req, res) => {
		const email = req.body.email || "unknown";
		// Use the built-in IP key generator to properly handle IPv6 addresses
		const ipKey = rateLimit.ipKeyGenerator(req, res);
		return `${ipKey}-${email}`;
	},
	// Skip successful requests from counting against the limit
	skipSuccessfulRequests: false,
	// Skip failed requests from counting against the limit
	skipFailedRequests: true,
	// Custom handler for when limit is exceeded
	handler: (req, res) => {
		const retryAfter = Math.round(req.rateLimit.resetTime / 1000);
		res.status(429).json({
			success: false,
			message: "Too many password reset requests from this IP and email combination. Please try again later.",
			retryAfter: retryAfter,
			remainingTime: `${Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000 / 60)} minutes`,
		});
	},
});

// General authentication rate limiter (for login attempts)
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 10, // Limit each IP to 10 login requests per windowMs
	message: {
		success: false,
		message: "Too many authentication attempts. Please try again in 15 minutes.",
		retryAfter: 15 * 60,
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Don't count successful logins
	skipFailedRequests: false, // Count failed logins
});

// Strict rate limiter for repeated failed attempts
const strictAuthLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // Limit each IP to 5 requests per hour for sensitive operations
	message: {
		success: false,
		message: "Too many failed attempts. Please try again in 1 hour.",
		retryAfter: 60 * 60,
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// Rate limiter for account creation
const signupLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 5, // Limit each IP to 5 account creations per hour
	message: {
		success: false,
		message: "Too many accounts created from this IP. Please try again in 1 hour.",
		retryAfter: 60 * 60,
	},
	standardHeaders: true,
	legacyHeaders: false,
});

module.exports = {
	passwordResetLimiter,
	authLimiter,
	strictAuthLimiter,
	signupLimiter,
};

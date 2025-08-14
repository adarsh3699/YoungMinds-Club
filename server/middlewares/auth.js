const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

// Authentication middleware - verify user is logged in
const isAuthenticated = async (req, res, next) => {
	try {
		let token;

		// Get token from Authorization header or cookies
		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}

		if (!token) {
			return res.status(401).json({
				success: false,
				message: "You are not logged in. Please log in to access this resource.",
			});
		}

		// Verify token
		const decoded = verifyToken(token);
		if (!decoded) {
			return res.status(401).json({
				success: false,
				message: "Invalid token or token expired.",
			});
		}

		// Find user with token's ID
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "User no longer exists.",
			});
		}

		// Check if user account is suspended
		if (user.status === "suspended") {
			return res.status(403).json({
				success: false,
				message: "Your account has been suspended. Please contact support for assistance.",
				isSuspended: true,
			});
		}

		// Attach user to request object
		req.user = user;
		next();
	} catch (error) {
		console.error("Authentication error:", error);
		res.status(500).json({
			success: false,
			message: "Authentication error",
		});
	}
};

// Role-based access control middleware
const authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "You must be logged in to access this resource.",
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: `User role '${req.user.role}' is not authorized to access this resource.`,
			});
		}

		next();
	};
};

// Optional authentication middleware - sets user if logged in, but doesn't fail if not
const optionalAuth = async (req, res, next) => {
	try {
		let token;

		// Get token from Authorization header or cookies
		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}

		// If no token, continue without setting user
		if (!token) {
			return next();
		}

		// Verify token
		const decoded = verifyToken(token);
		if (!decoded) {
			return next(); // Continue without user if token is invalid
		}

		// Find user with token's ID
		const user = await User.findById(decoded.id);
		if (user) {
			req.user = user; // Set user if found
		}

		next();
	} catch (error) {
		console.error("Optional authentication error:", error);
		// Continue without user if there's an error
		next();
	}
};

// Middleware to check if user is an approved organizer (can create events/internships)
const requireApprovedOrganizer = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({
			success: false,
			message: "You must be logged in to access this resource.",
		});
	}

	// Admin users can always create content
	if (req.user.role === "admin") {
		return next();
	}

	// Check if user is organizer with approved status
	if (req.user.role !== "organizer") {
		return res.status(403).json({
			success: false,
			message: "Only organizers can access this resource. Please apply to become an organizer.",
		});
	}

	if (req.user.organizerStatus !== "approved") {
		let message = "Your organizer account is not approved yet.";

		if (req.user.organizerStatus === "pending") {
			message =
				"Your organizer application is pending admin approval. Please wait for approval before creating events or internships.";
		} else if (req.user.organizerStatus === "rejected") {
			message = "Your organizer application was rejected. Please contact support for more information.";
		} else if (req.user.organizerStatus === "none") {
			message = "Please apply to become an organizer before creating events or internships.";
		}

		return res.status(403).json({
			success: false,
			message,
			organizerStatus: req.user.organizerStatus,
		});
	}

	next();
};

module.exports = {
	isAuthenticated,
	authorizeRoles,
	optionalAuth,
	requireApprovedOrganizer,
};

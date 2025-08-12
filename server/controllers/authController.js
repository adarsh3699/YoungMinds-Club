const User = require("../models/User");
const { generateToken } = require("../utils/jwt");
const { validationResult } = require("express-validator");
const { setupGoogleAuth } = require("../config/google");
const { sendPasswordResetEmail, sendPasswordChangeConfirmation } = require("../services/emailService");

// Register new user
exports.signup = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: errors.array(),
			});
		}

		const { name, email, password, role } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists with this email",
			});
		}

		// Create new user
		const user = await User.create({
			name,
			email,
			password,
			role: role && ["user", "organizer"].includes(role) ? role : "user", // Only allow user and organizer roles
		});

		// Generate JWT token
		const token = generateToken(user._id, user.role);

		// Set cookie
		res.cookie("token", token, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			secure: process.env.NODE_ENV === "production",
		});

		// Send response
		res.status(201).json({
			success: true,
			message: "User registered successfully",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
				status: user.status,
			},
		});
	} catch (error) {
		console.error("Signup error:", error);
		res.status(500).json({
			success: false,
			message: "Registration failed",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Login user
exports.login = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: errors.array(),
			});
		}

		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
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

		// Check if password is correct
		if (!user.password) {
			return res.status(401).json({
				success: false,
				message:
					"This account uses Google authentication. Please login with Google, or use 'Forgot Password' to set up email login.",
			});
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Generate JWT token
		const token = generateToken(user._id, user.role);

		// Set cookie
		res.cookie("token", token, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			secure: process.env.NODE_ENV === "production",
		});

		// Send response
		res.status(200).json({
			success: true,
			message: "Login successful",
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
				status: user.status,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Login failed",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Google OAuth callback
exports.googleCallback = async (req, res) => {
	try {
		const { code } = req.query;

		if (!code) {
			return res.status(400).json({
				success: false,
				message: "Authorization code is required",
			});
		}

		// Process the authorization code and get user info and token
		const { user, token } = await setupGoogleAuth(code);

		// Set cookie
		res.cookie("token", token, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			secure: process.env.NODE_ENV === "production",
			sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
		});

		// Get the client URL properly - handle comma-separated URLs
		const clientURLs = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
		const clientURL = clientURLs[0].trim();

		// Redirect to frontend with token
		res.redirect(`${clientURL}/auth/success?token=${token}`);
	} catch (error) {
		console.error("Google OAuth error:", error);

		// Get the client URL properly - handle comma-separated URLs
		const clientURLs = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
		const clientURL = clientURLs[0].trim();

		// For suspended users, redirect to auth success with suspended parameter
		if (error.isSuspended) {
			res.redirect(`${clientURL}/auth/success?suspended=true`);
		} else {
			res.redirect(`${clientURL}/auth/error`);
		}
	}
};

// Get current user
exports.getCurrentUser = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");

		// Check if user account is suspended (double-check)
		if (user.status === "suspended") {
			return res.status(403).json({
				success: false,
				message: "Your account has been suspended. Please contact support for assistance.",
				isSuspended: true,
			});
		}

		res.status(200).json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
				status: user.status,
			},
		});
	} catch (error) {
		console.error("Get current user error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to get user data",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Logout user
exports.logout = (req, res) => {
	res.cookie("token", "none", {
		expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		message: "Logged out successfully",
	});
};

// Forgot password
exports.forgotPassword = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: errors.array(),
			});
		}

		const { email } = req.body;

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			// For security, don't reveal if email exists or not
			return res.status(200).json({
				success: true,
				message: "If an account with that email exists, you will receive a password reset email.",
			});
		}

		// Check if user account is suspended
		if (user.status === "suspended") {
			return res.status(403).json({
				success: false,
				message: "Your account has been suspended. Please contact support for assistance.",
			});
		}

		// Allow Google OAuth users to set up a password (but inform them)
		const isGoogleOnlyAccount = user.googleId && !user.password;

		// Generate password reset token
		const resetToken = user.createPasswordResetToken();
		await user.save({ validateBeforeSave: false });

		try {
			// Send password reset email
			await sendPasswordResetEmail(user.email, user.name, resetToken, isGoogleOnlyAccount);

			const responseMessage = isGoogleOnlyAccount
				? "Password setup email sent successfully. You'll be able to log in with both Google and your new password."
				: "Password reset email sent successfully.";

			res.status(200).json({
				success: true,
				message: responseMessage,
			});
		} catch (emailError) {
			// If email fails, remove the reset token
			user.passwordResetToken = undefined;
			user.passwordResetExpires = undefined;
			await user.save({ validateBeforeSave: false });

			console.error("Email sending failed:", emailError);
			return res.status(500).json({
				success: false,
				message: "There was an error sending the email. Please try again later.",
			});
		}
	} catch (error) {
		console.error("Forgot password error:", error);
		res.status(500).json({
			success: false,
			message: "Something went wrong. Please try again later.",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Reset password
exports.resetPassword = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: errors.array(),
			});
		}

		const { token, password } = req.body;

		// Find user with valid reset token
		const user = await User.findOne({
			passwordResetToken: { $exists: true },
			passwordResetExpires: { $gt: Date.now() },
		});

		if (!user || !user.isPasswordResetTokenValid(token)) {
			return res.status(400).json({
				success: false,
				message: "Password reset token is invalid or has expired.",
			});
		}

		// Check if user account is suspended
		if (user.status === "suspended") {
			return res.status(403).json({
				success: false,
				message: "Your account has been suspended. Please contact support for assistance.",
			});
		}

		// Check if this is a Google user setting up their first password
		const isSettingUpPassword = user.googleId && !user.password;

		// Update password and remove reset token
		user.password = password;
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		// Generate new JWT token
		const jwtToken = generateToken(user._id, user.role);

		// Set cookie
		res.cookie("token", jwtToken, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			secure: process.env.NODE_ENV === "production",
		});

		try {
			// Send password change confirmation email
			await sendPasswordChangeConfirmation(user.email, user.name);
		} catch (emailError) {
			console.error("Confirmation email failed:", emailError);
			// Don't fail the request if confirmation email fails
		}

		const successMessage = isSettingUpPassword
			? "Password created successfully! You can now log in with either Google or your email and password."
			: "Password reset successfully. You are now logged in.";

		res.status(200).json({
			success: true,
			message: successMessage,
			token: jwtToken,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
				status: user.status,
			},
		});
	} catch (error) {
		console.error("Reset password error:", error);
		res.status(500).json({
			success: false,
			message: "Something went wrong. Please try again later.",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

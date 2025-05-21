const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');
const { setupGoogleAuth } = require('../config/google');

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
				message: 'User already exists with this email',
			});
		}

		// Create new user
		const user = await User.create({
			name,
			email,
			password,
			role: role && ['user', 'organizer'].includes(role) ? role : 'user', // Only allow user and organizer roles
		});

		// Generate JWT token
		const token = generateToken(user._id, user.role);

		// Set cookie
		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			secure: process.env.NODE_ENV === 'production',
		});

		// Send response
		res.status(201).json({
			success: true,
			message: 'User registered successfully',
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
			},
		});
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({
			success: false,
			message: 'Registration failed',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
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
				message: 'Invalid email or password',
			});
		}

		// Check if password is correct
		if (!user.password) {
			return res.status(401).json({
				success: false,
				message: 'This account uses Google authentication. Please login with Google.',
			});
		}

		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: 'Invalid email or password',
			});
		}

		// Generate JWT token
		const token = generateToken(user._id, user.role);

		// Set cookie
		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			secure: process.env.NODE_ENV === 'production',
		});

		// Send response
		res.status(200).json({
			success: true,
			message: 'Login successful',
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
			},
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			message: 'Login failed',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
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
				message: 'Authorization code is required',
			});
		}

		// Process the authorization code and get user info and token
		const { user, token } = await setupGoogleAuth(code);

		// Set cookie
		res.cookie('token', token, {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
			secure: process.env.NODE_ENV === 'production',
			sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
		});

		// Get the client URL properly - handle comma-separated URLs
		const clientURLs = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
		const clientURL = clientURLs[0].trim();

		// Redirect to frontend with token
		res.redirect(`${clientURL}/auth/success?token=${token}`);
	} catch (error) {
		console.error('Google OAuth error:', error);
		res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/error`);
	}
};

// Get current user
exports.getCurrentUser = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select('-password');

		res.status(200).json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
			},
		});
	} catch (error) {
		console.error('Get current user error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get user data',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Logout user
exports.logout = (req, res) => {
	res.cookie('token', 'none', {
		expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		message: 'Logged out successfully',
	});
};

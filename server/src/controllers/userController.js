const User = require("../models/User");
const UserActivity = require("../models/UserActivity");
const { uploadProfilePicture, cloudinary } = require("../config/cloudinary");
const { replaceImage } = require("../utils/cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Check if Cloudinary credentials are available
const hasCloudinaryCredentials =
	process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

// Configure fallback storage for when Cloudinary is not available
let upload;

if (hasCloudinaryCredentials) {
	// Use the centralized Cloudinary configuration
	upload = uploadProfilePicture.single("profilePicture");
} else {
	// Create uploads directory if it doesn't exist (only in non-serverless environments)
	const uploadsDir = path.join(__dirname, "../uploads/profile_pictures");
	try {
		if (!fs.existsSync(uploadsDir)) {
			fs.mkdirSync(uploadsDir, { recursive: true });
		}
	} catch (error) {
		console.warn("Could not create uploads directory (serverless environment):", error.message);
	}

	// Configure local disk storage for development
	const diskStorage = multer.diskStorage({
		destination: (req, file, cb) => {
			cb(null, uploadsDir);
		},
		filename: (req, file, cb) => {
			const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
			const ext = path.extname(file.originalname);
			cb(null, "profile-" + uniqueSuffix + ext);
		},
	});

	// Configure Multer with local storage
	upload = multer({
		storage: diskStorage,
		limits: { fileSize: 3 * 1024 * 1024 }, // 3MB file size limit (matching config)
		fileFilter: (req, file, cb) => {
			const filetypes = /jpeg|jpg|png|gif|webp/;
			const mimetype = filetypes.test(file.mimetype);
			const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

			if (mimetype && extname) {
				return cb(null, true);
			}

			cb(new Error("Only image files (jpg, jpeg, png, gif, webp) are allowed!"));
		},
	}).single("profilePicture");

	// Log a warning about missing Cloudinary credentials
	console.warn("Cloudinary credentials not found. Using local storage for profile pictures.");
	console.warn("For production, please configure Cloudinary. See README-CLOUDINARY.md.");
}

// Get user dashboard data
exports.getDashboard = async (req, res) => {
	try {
		// Get user info without password
		const user = await User.findById(req.user._id).select("-password");

		// Get user activity data
		const userActivity = await UserActivity.findOne({ user: req.user._id });

		// Create clean, single response object
		res.status(200).json({
			success: true,
			profile: {
				_id: user._id,
				name: user.name,
				email: user.email,
				profilePicture: user.profilePicture,
				role: user.role,
				status: user.status,
				college: user.college,
				xp: userActivity ? userActivity.xp : 0,
				badge: userActivity ? userActivity.badge : "Newbie",
				streakCount: userActivity ? userActivity.streakCount : 0,
				organizerStatus: user.organizerStatus,
				organizerApplication: user.organizerApplication,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		});
	} catch (error) {
		console.error("Get user dashboard error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch dashboard data",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Update user profile
exports.updateProfile = async (req, res) => {
	try {
		const { name, email, college } = req.body;

		// Create object with allowed fields
		const updateData = {};
		if (name) updateData.name = name;
		if (email) updateData.email = email;
		if (college) updateData.college = college;

		// Update user
		const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select(
			"-password"
		);

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
				college: user.college,
			},
		});
	} catch (error) {
		console.error("Update profile error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update profile",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Upload profile picture
exports.uploadProfilePicture = (req, res) => {
	upload(req, res, async (err) => {
		if (err) {
			console.error("Profile picture upload error:", err);
			return res.status(400).json({
				success: false,
				message: err.message || "Error uploading profile picture",
			});
		}

		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: "No file uploaded",
			});
		}

		try {
			// Get current user to check for existing profile picture
			const currentUser = await User.findById(req.user._id).select("profilePicture");
			if (!currentUser) {
				return res.status(404).json({
					success: false,
					message: "User not found",
				});
			}

			let profilePicturePath;

			if (hasCloudinaryCredentials) {
				// When using Cloudinary, the path is already in the file object
				profilePicturePath = req.file.path;
			} else {
				// For local storage, construct a URL path
				const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
				const relativePath = "/uploads/profile_pictures/" + req.file.filename;
				profilePicturePath = baseUrl + relativePath;
			}

			// Update user with new profile picture URL
			const user = await User.findByIdAndUpdate(
				req.user._id,
				{ profilePicture: profilePicturePath },
				{ new: true }
			).select("-password");

			// Delete old profile picture from Cloudinary if it exists and is different
			if (
				hasCloudinaryCredentials &&
				currentUser.profilePicture &&
				currentUser.profilePicture !== profilePicturePath
			) {
				await replaceImage(currentUser.profilePicture, profilePicturePath);
			}

			res.status(200).json({
				success: true,
				message: "Profile picture updated successfully",
				profilePicture: user.profilePicture,
			});
		} catch (error) {
			console.error("Error saving profile picture to user:", error);
			res.status(500).json({
				success: false,
				message: "Error saving profile picture",
				error: process.env.NODE_ENV === "development" ? error.message : null,
			});
		}
	});
};

// Apply for organizer status
exports.applyForOrganizer = async (req, res) => {
	try {
		const { organizationName, reason, experience, socialLinks } = req.body;
		const userId = req.user._id;

		// Validate required fields
		if (!organizationName || !reason || !experience) {
			return res.status(400).json({
				success: false,
				message: "Organization name, reason, and experience are required",
			});
		}

		// Get current user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Check if user already has a pending or approved application
		if (user.organizerStatus === "pending") {
			return res.status(400).json({
				success: false,
				message: "You already have a pending organizer application",
			});
		}

		if (user.organizerStatus === "approved") {
			return res.status(400).json({
				success: false,
				message: "You are already an approved organizer",
			});
		}

		// Check reapplication limit (max 3 attempts after rejection)
		if (
			user.organizerStatus === "rejected" &&
			user.organizerApplication &&
			user.organizerApplication.reapplicationCount >= 3
		) {
			return res.status(400).json({
				success: false,
				message:
					"You have reached the maximum number of reapplication attempts (3). Please contact support if you need further assistance.",
			});
		}

		// Update user with application data (keep role as "user" until approved)
		await User.findByIdAndUpdate(userId, {
			organizerStatus: "pending",
			organizerApplication: {
				organizationName,
				reason,
				experience,
				socialLinks: socialLinks || "",
				appliedAt: new Date(),
			},
		});

		res.status(200).json({
			success: true,
			message: "Organizer application submitted successfully. Please wait for admin approval.",
		});
	} catch (error) {
		console.error("Error submitting organizer application:", error);
		res.status(500).json({
			success: false,
			message: "Failed to submit organizer application",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Update organizer application (for pending applications)
exports.updateOrganizerApplication = async (req, res) => {
	try {
		const { organizationName, reason, experience, socialLinks } = req.body;
		const userId = req.user._id;

		// Validate required fields
		if (!organizationName || !reason || !experience) {
			return res.status(400).json({
				success: false,
				message: "Organization name, reason, and experience are required",
			});
		}

		// Get current user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Check if user has a pending application
		if (user.organizerStatus !== "pending") {
			return res.status(400).json({
				success: false,
				message: "You can only edit pending applications",
			});
		}

		// Update application data
		await User.findByIdAndUpdate(userId, {
			"organizerApplication.organizationName": organizationName,
			"organizerApplication.reason": reason,
			"organizerApplication.experience": experience,
			"organizerApplication.socialLinks": socialLinks || "",
		});

		res.status(200).json({
			success: true,
			message: "Application updated successfully",
		});
	} catch (error) {
		console.error("Error updating organizer application:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update organizer application",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Cancel organizer application (for pending applications)
exports.cancelOrganizerApplication = async (req, res) => {
	try {
		const userId = req.user._id;

		// Get current user
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Check if user has a pending application
		if (user.organizerStatus !== "pending") {
			return res.status(400).json({
				success: false,
				message: "You can only cancel pending applications",
			});
		}

		// Reset organizer status and clear application data
		await User.findByIdAndUpdate(userId, {
			organizerStatus: "none",
			$unset: {
				organizerApplication: 1,
			},
		});

		res.status(200).json({
			success: true,
			message: "Application cancelled successfully",
		});
	} catch (error) {
		console.error("Error cancelling organizer application:", error);
		res.status(500).json({
			success: false,
			message: "Failed to cancel organizer application",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

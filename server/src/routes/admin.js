const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/adminController");
const { isAuthenticated, authorizeRoles } = require("../middlewares/auth");
const { handleMulterError } = require("../middlewares/otherUtils");
const { upload, uploadProfilePicture } = require("../config/cloudinary");
const User = require("../models/User");

const router = express.Router();

// Apply authentication and admin role check to all routes
router.use(isAuthenticated, authorizeRoles("admin"));

// Admin profile routes
router.get("/profile", adminController.getAdminProfile);
router.post(
	"/profile/picture",
	uploadProfilePicture.single("profilePicture"),
	handleMulterError,
	adminController.uploadProfilePicture
);
router.put("/profile", adminController.updateAdminProfile);

// Admin logs route
router.get("/logs", adminController.getAdminLogs);

// Admin team route
router.get("/team", adminController.getAdminTeam);

// Dashboard and analytics routes
router.get("/dashboard/stats", adminController.getDashboardStats);
router.get("/analytics", adminController.getAnalytics);
router.get("/flagged-content", adminController.getFlaggedContent);

// User management routes
router.get("/users", adminController.getAllUsers);
router.get("/active-users", adminController.getActiveUsers);
router.get("/users/:id", adminController.getUser);
router.put(
	"/users/:id/role",
	[body("role").notEmpty().withMessage("Role is required")],
	adminController.updateUserRole
);
router.put(
	"/users/:id/status",
	[body("status").notEmpty().withMessage("Status is required")],
	adminController.updateUserStatus
);
router.put(
	"/users/:id/flag",
	[body("isFlagged").isBoolean().withMessage("isFlagged must be a boolean")],
	adminController.toggleUserFlag
);
router.delete("/users/:id", adminController.deleteUser);

// Organizer management routes
router.get("/organizers", adminController.getAllOrganizers);
router.get("/top-organizers", adminController.getTopOrganizers);

// Organizer application management routes
router.get("/organizer-applications", adminController.getOrganizerApplications);
router.put("/organizer-applications/:id/approve", adminController.approveOrganizerApplication);
router.put(
	"/organizer-applications/:id/reject",
	[body("rejectionReason").optional().isString().withMessage("Rejection reason must be a string")],
	adminController.rejectOrganizerApplication
);

// Event management routes
router.get("/events", adminController.getAllEvents);
router.put("/events/:id", upload.single("poster"), handleMulterError, adminController.updateEvent);
router.put(
	"/events/:id/flag",
	[body("isFlagged").isBoolean().withMessage("isFlagged must be a boolean")],
	adminController.toggleEventFlag
);
router.put(
	"/events/:id/feature",
	[body("isFeatured").isBoolean().withMessage("isFeatured must be a boolean")],
	adminController.toggleEventFeature
);
router.delete("/events/:id", adminController.deleteEvent);

// Internship management routes
router.get("/internships", adminController.getAllInternships);
router.put("/internships/:id", upload.single("poster"), handleMulterError, adminController.updateInternship);
router.put(
	"/internships/:id/flag",
	[body("isFlagged").isBoolean().withMessage("isFlagged must be a boolean")],
	adminController.toggleInternshipFlag
);
router.put(
	"/internships/:id/feature",
	[body("isFeatured").isBoolean().withMessage("isFeatured must be a boolean")],
	adminController.toggleInternshipFeature
);
router.delete("/internships/:id", adminController.deleteInternship);

// Moderation routes
router.get("/moderation/flagged", adminController.getFlaggedItems);

// Announcement routes
router.post(
	"/announcements",
	[
		body("title").notEmpty().withMessage("Title is required"),
		body("message").notEmpty().withMessage("Message is required"),
	],
	adminController.createAnnouncement
);
router.get("/announcements", adminController.getAnnouncements);
router.put(
	"/announcements/:id",
	[body("isActive").isBoolean().withMessage("isActive must be a boolean")],
	adminController.updateAnnouncementStatus
);
router.delete("/announcements/:id", adminController.deleteAnnouncement);

// Test endpoint to suspend a user (for demonstration)
router.post("/test-suspend/:id", isAuthenticated, authorizeRoles("admin"), async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.params.id, { status: "suspended" }, { new: true }).select(
			"-password"
		);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "User suspended for demonstration",
			user,
		});
	} catch (error) {
		console.error("Test suspend error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to suspend user",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
});

module.exports = router;

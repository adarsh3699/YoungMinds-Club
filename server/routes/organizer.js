const express = require("express");
const organizerController = require("../controllers/organizerController");
const { isAuthenticated, authorizeRoles, requireApprovedOrganizer } = require("../middlewares/auth");
const { handleMulterError } = require("../middlewares/otherUtils");
const { upload, uploadOrganizerLogo } = require("../config/cloudinary");

const router = express.Router();

// Apply authentication and organizer role check to all routes
router.use(isAuthenticated, authorizeRoles("organizer", "admin"));

// Profile routes
router.get("/profile", organizerController.getProfile);
router.put("/profile", organizerController.updateProfile);
router.post(
	"/profile/picture",
	uploadOrganizerLogo.single("organizerBrandLogo"),
	handleMulterError,
	organizerController.uploadProfilePicture
);

// Dashboard routes
router.get("/dashboard", organizerController.getDashboard);
router.get("/feedback/summary", organizerController.getFeedbackSummary);

// Event management routes
router.get("/events", organizerController.getEvents);
router.post(
	"/events",
	requireApprovedOrganizer,
	upload.single("poster"),
	handleMulterError,
	organizerController.createEvent
);
router.get("/events/:id", organizerController.getEventDetails);
router.put(
	"/events/:id",
	requireApprovedOrganizer,
	upload.single("poster"),
	handleMulterError,
	organizerController.updateEvent
);
router.delete("/events/:id", requireApprovedOrganizer, organizerController.deleteEvent);

// Attendee management
router.get("/events/:id/attendees", organizerController.getEventAttendees);

// Internship management routes
router.get("/internships", organizerController.getInternships);
router.post(
	"/internships",
	requireApprovedOrganizer,
	upload.single("poster"),
	handleMulterError,
	organizerController.createInternship
);
router.get("/internships/:id", organizerController.getInternshipDetails);
router.put(
	"/internships/:id",
	requireApprovedOrganizer,
	upload.single("poster"),
	handleMulterError,
	organizerController.updateInternship
);
router.delete("/internships/:id", requireApprovedOrganizer, organizerController.deleteInternship);

// Internship applicant management
router.get("/internships/:id/applicants", organizerController.getInternshipApplicants);

module.exports = router;

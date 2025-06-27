const User = require("../models/User");
const Event = require("../models/Event");
const EventRegistration = require("../models/EventRegistration");
const Internship = require("../models/Internship");
const InternshipApplication = require("../models/InternshipApplication");
const { cloudinary } = require("../config/cloudinary");
const { deleteImage, replaceImage } = require("../utils/cloudinary");

// Get organizer profile
exports.getProfile = async (req, res) => {
	try {
		// Get organizer info without password
		const user = await User.findById(req.user._id).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Format the profile data
		const profile = {
			_id: user._id,
			name: user.name,
			email: user.email,
			organizationName: user.organizationName || "",
			bio: user.bio || "",
			organizerBrandLogo: user.organizerBrandLogo || "",
			socialLinks: user.socialLinks || {
				website: "",
				linkedin: "",
				twitter: "",
				instagram: "",
			},
		};

		res.status(200).json({
			success: true,
			profile,
		});
	} catch (error) {
		console.error("Get organizer profile error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch profile data",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Update organizer profile
exports.updateProfile = async (req, res) => {
	try {
		const { name, email, organizationName, bio, socialLinks } = req.body;

		// Create object with allowed fields
		const updateData = {};
		if (name) updateData.name = name;
		if (email) updateData.email = email;
		if (organizationName !== undefined) updateData.organizationName = organizationName;
		if (bio !== undefined) updateData.bio = bio;
		if (socialLinks) updateData.socialLinks = socialLinks;

		// Update user
		const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select(
			"-password"
		);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Format the profile data
		const profile = {
			_id: user._id,
			name: user.name,
			email: user.email,
			organizationName: user.organizationName || "",
			bio: user.bio || "",
			organizerBrandLogo: user.organizerBrandLogo || "",
			socialLinks: user.socialLinks || {
				website: "",
				linkedin: "",
				twitter: "",
				instagram: "",
			},
		};

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			profile,
		});
	} catch (error) {
		console.error("Update organizer profile error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update profile",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Upload organizer brand logo
exports.uploadProfilePicture = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: "No file uploaded",
			});
		}

		// Get current user to check for existing logo
		const currentUser = await User.findById(req.user._id).select("organizerBrandLogo");
		if (!currentUser) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// The logo URL should be in req.file.path thanks to multer-cloudinary
		const organizerBrandLogo = req.file.path;

		// Update user with new organizer brand logo URL
		const user = await User.findByIdAndUpdate(req.user._id, { organizerBrandLogo }, { new: true }).select(
			"-password"
		);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Delete old logo from Cloudinary if it exists and is different
		if (currentUser.organizerBrandLogo && currentUser.organizerBrandLogo !== organizerBrandLogo) {
			await replaceImage(currentUser.organizerBrandLogo, organizerBrandLogo);
		}

		res.status(200).json({
			success: true,
			message: "Brand logo updated successfully",
			organizerBrandLogo: user.organizerBrandLogo,
		});
	} catch (error) {
		console.error("Upload brand logo error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to upload brand logo",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get organizer dashboard data
exports.getDashboard = async (req, res) => {
	try {
		// Get organizer info without password
		const user = await User.findById(req.user._id).select("-password");

		// Get count of events organized by this user
		const eventCount = await Event.countDocuments({ organizer: req.user._id });

		// Get total attendees across all events
		const events = await Event.find({ organizer: req.user._id }).select("_id");
		const eventIds = events.map((event) => event._id);

		const attendeeCount = await EventRegistration.countDocuments({
			event: { $in: eventIds },
			status: { $in: ["registered", "attended"] },
		});

		// Calculate total revenue (if applicable)
		const revenue = await Event.aggregate([
			{ $match: { organizer: req.user._id } },
			{ $group: { _id: null, total: { $sum: "$price" } } },
		]);

		const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

		// Get internship statistics
		const internshipCount = await Internship.countDocuments({ organizer: req.user._id });

		// Get total applications across all internships
		const internships = await Internship.find({ organizer: req.user._id }).select("_id");
		const internshipIds = internships.map((internship) => internship._id);

		const applicationCount = await InternshipApplication.countDocuments({
			internship: { $in: internshipIds },
			status: { $in: ["pending", "accepted", "rejected"] },
		});

		// Count upcoming events and active internships
		const now = new Date();
		const upcomingEvents = await Event.countDocuments({
			organizer: req.user._id,
			date: { $gte: now },
			status: "published",
		});

		const activeInternships = await Internship.countDocuments({
			organizer: req.user._id,
			applicationDeadline: { $gte: now },
			status: "published",
		});

		res.status(200).json({
			success: true,
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					profilePicture: user.profilePicture,
				},
				stats: {
					eventCount,
					attendeeCount,
					revenue: totalRevenue,
					internshipCount,
					applicationCount,
					upcomingEvents,
					activeInternships,
				},
			},
		});
	} catch (error) {
		console.error("Get organizer dashboard error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch dashboard data",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get events created by the organizer
exports.getEvents = async (req, res) => {
	try {
		const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: events.length,
			events,
		});
	} catch (error) {
		console.error("Get organizer events error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch events",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Create a new event
exports.createEvent = async (req, res) => {
	try {
		const eventData = {
			...req.body,
			organizer: req.user._id,
		};

		// Reconstruct location object from dot-notation properties
		const location = {};
		Object.keys(req.body).forEach((key) => {
			if (key.startsWith("location.")) {
				const locationKey = key.split(".")[1];
				location[locationKey] = req.body[key];
			}
		});

		if (Object.keys(location).length > 0) {
			eventData.location = location;

			// Remove dot-notation location properties
			Object.keys(eventData).forEach((key) => {
				if (key.startsWith("location.")) {
					delete eventData[key];
				}
			});
		}

		// If there's a poster file, the URL should already be in req.file.path from multer-cloudinary
		if (req.file) {
			eventData.poster = req.file.path;
		}

		const event = await Event.create(eventData);

		res.status(201).json({
			success: true,
			message: "Event created successfully",
			event,
		});
	} catch (error) {
		console.error("Create event error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create event",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get a single event with detailed info
exports.getEventDetails = async (req, res) => {
	try {
		const event = await Event.findOne({
			_id: req.params.id,
			organizer: req.user._id,
		});

		if (!event) {
			return res.status(404).json({
				success: false,
				message: "Event not found or you do not have permission",
			});
		}

		// Get registrations for this event
		const registrations = await EventRegistration.find({ event: event._id })
			.populate("user", "name email profilePicture")
			.sort({ registrationDate: -1 });

		// Get daily registration count for chart
		const dailyRegistrations = await EventRegistration.aggregate([
			{ $match: { event: event._id } },
			{
				$group: {
					_id: {
						$dateToString: { format: "%Y-%m-%d", date: "$registrationDate" },
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		res.status(200).json({
			success: true,
			event,
			registrations,
			analytics: {
				totalRegistrations: registrations.length,
				dailyRegistrations: dailyRegistrations.map((item) => ({
					date: item._id,
					count: item.count,
				})),
			},
		});
	} catch (error) {
		console.error("Get event details error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch event details",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Update an event
exports.updateEvent = async (req, res) => {
	try {
		// Check if the event exists and belongs to this organizer
		const event = await Event.findOne({
			_id: req.params.id,
			organizer: req.user._id,
		});

		if (!event) {
			return res.status(404).json({
				success: false,
				message: "Event not found or you do not have permission",
			});
		}

		// Update event data
		const updateData = { ...req.body };

		// Reconstruct location object from dot-notation properties
		const location = {};
		Object.keys(req.body).forEach((key) => {
			if (key.startsWith("location.")) {
				const locationKey = key.split(".")[1];
				location[locationKey] = req.body[key];
			}
		});

		if (Object.keys(location).length > 0) {
			updateData.location = location;

			// Remove dot-notation location properties
			Object.keys(updateData).forEach((key) => {
				if (key.startsWith("location.")) {
					delete updateData[key];
				}
			});
		}

		// If there's a new poster file
		if (req.file) {
			updateData.poster = req.file.path;

			// Delete old poster image from Cloudinary if it exists
			if (event.poster && event.poster !== req.file.path) {
				await replaceImage(event.poster, req.file.path);
			}
		}

		const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updateData, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			message: "Event updated successfully",
			event: updatedEvent,
		});
	} catch (error) {
		console.error("Update event error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update event",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Delete an event
exports.deleteEvent = async (req, res) => {
	try {
		// Check if the event exists and belongs to this organizer
		const event = await Event.findOne({
			_id: req.params.id,
			organizer: req.user._id,
		});

		if (!event) {
			return res.status(404).json({
				success: false,
				message: "Event not found or you do not have permission",
			});
		}

		// Delete event registrations
		await EventRegistration.deleteMany({ event: req.params.id });

		// Delete event
		await Event.findByIdAndDelete(req.params.id);

		// Delete poster image from Cloudinary if it exists
		if (event.poster) {
			await deleteImage(event.poster);
		}

		res.status(200).json({
			success: true,
			message: "Event deleted successfully",
		});
	} catch (error) {
		console.error("Delete event error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete event",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get attendees list for a specific event
exports.getEventAttendees = async (req, res) => {
	try {
		// Check if the event exists and belongs to this organizer
		const event = await Event.findOne({
			_id: req.params.id,
			organizer: req.user._id,
		});

		if (!event) {
			return res.status(404).json({
				success: false,
				message: "Event not found or you do not have permission",
			});
		}

		// Get registrations with user details
		const attendees = await EventRegistration.find({
			event: req.params.id,
			status: { $in: ["registered", "attended"] },
		})
			.populate("user", "name email profilePicture")
			.sort({ registrationDate: -1 });

		res.status(200).json({
			success: true,
			count: attendees.length,
			attendees: attendees.map((reg) => ({
				id: reg._id,
				userId: reg.user._id,
				name: reg.user.name,
				email: reg.user.email,
				profilePicture: reg.user.profilePicture,
				registrationDate: reg.registrationDate,
				status: reg.status,
				hasFeedback: reg.feedback.submitted,
			})),
		});
	} catch (error) {
		console.error("Get event attendees error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch attendees",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get feedback summary for organizer's events
exports.getFeedbackSummary = async (req, res) => {
	try {
		// Get all events by this organizer
		const events = await Event.find({ organizer: req.user._id }).select("_id title");

		// Get feedback for these events
		const feedback = await EventRegistration.aggregate([
			{
				$match: {
					event: { $in: events.map((event) => event._id) },
					feedback: { $exists: true, $ne: null },
				},
			},
			{
				$group: {
					_id: "$event",
					averageRating: { $avg: "$feedback.rating" },
					totalFeedback: { $sum: 1 },
					feedback: {
						$push: {
							rating: "$feedback.rating",
							comment: "$feedback.comment",
							date: "$feedback.date",
						},
					},
				},
			},
		]);

		// Format the response
		const summary = events.map((event) => {
			const eventFeedback = feedback.find((f) => f._id.toString() === event._id.toString());
			return {
				eventId: event._id,
				eventTitle: event.title,
				averageRating: eventFeedback ? eventFeedback.averageRating : 0,
				totalFeedback: eventFeedback ? eventFeedback.totalFeedback : 0,
				feedback: eventFeedback ? eventFeedback.feedback : [],
			};
		});

		// Calculate overall statistics
		const overallStats = {
			totalEvents: events.length,
			totalFeedback: feedback.reduce((sum, f) => sum + f.totalFeedback, 0),
			averageRating:
				feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.averageRating, 0) / feedback.length : 0,
		};

		res.status(200).json({
			success: true,
			data: {
				summary,
				overallStats,
			},
		});
	} catch (error) {
		console.error("Get feedback summary error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch feedback summary",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// INTERNSHIP MANAGEMENT METHODS

// Get organizer's internships
exports.getInternships = async (req, res) => {
	try {
		const internships = await Internship.find({ organizer: req.user._id }).sort({ createdAt: -1 });

		// Add application count to each internship
		const internshipsWithCount = await Promise.all(
			internships.map(async (internship) => {
				const applicationCount = await InternshipApplication.countDocuments({
					internship: internship._id,
					status: { $in: ["pending", "accepted", "rejected"] },
				});

				return {
					...internship.toObject(),
					applicationCount,
				};
			})
		);

		res.status(200).json({
			success: true,
			count: internshipsWithCount.length,
			internships: internshipsWithCount,
		});
	} catch (error) {
		console.error("Get organizer internships error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch internships",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Create a new internship
exports.createInternship = async (req, res) => {
	try {
		let {
			title,
			companyName,
			shortDescription,
			description,
			type,
			category,
			applicationDeadline,
			startDate,
			location,
			compensation,
			duration,
			capacity,
			skills,
			requirements,
			responsibilities,
			benefits,
			isPublished,
		} = req.body;

		// Handle FormData format fallback for createInternship
		if (!location && req.body["location.type"]) {
			location = JSON.stringify({
				type: req.body["location.type"] || "remote",
				city: req.body["location.city"] || "",
				country: req.body["location.country"] || "",
				address: req.body["location.address"] || "",
			});
		}

		if (!compensation && req.body["compensation.type"]) {
			compensation = JSON.stringify({
				type: req.body["compensation.type"] || "",
				amount: parseFloat(req.body["compensation.amount"]) || 0,
				currency: req.body["compensation.currency"] || "USD",
			});
		}

		// Parse JSON fields
		let parsedLocation,
			parsedCompensation,
			parsedSkills,
			parsedRequirements,
			parsedResponsibilities,
			parsedBenefits;

		try {
			parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
			parsedCompensation = typeof compensation === "string" ? JSON.parse(compensation) : compensation;
			parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills || [];
			parsedRequirements = typeof requirements === "string" ? JSON.parse(requirements) : requirements || [];
			parsedResponsibilities =
				typeof responsibilities === "string" ? JSON.parse(responsibilities) : responsibilities || [];
			parsedBenefits = typeof benefits === "string" ? JSON.parse(benefits) : benefits || [];
		} catch (parseError) {
			return res.status(400).json({
				success: false,
				message: "Invalid JSON data provided",
			});
		}

		const internshipData = {
			title,
			companyName,
			shortDescription,
			description,
			type,
			category,
			applicationDeadline,
			startDate: startDate || null,
			location: parsedLocation,
			compensation: parsedCompensation,
			duration,
			capacity: parseInt(capacity) || 1,
			skills: parsedSkills,
			requirements: parsedRequirements,
			responsibilities: parsedResponsibilities,
			benefits: parsedBenefits,
			company: req.user._id,
			isPublished: isPublished === "true" || isPublished === true,
			status: isPublished === "true" || isPublished === true ? "published" : "draft",
		};

		// Add poster URL if file was uploaded
		if (req.file) {
			internshipData.poster = req.file.path;
		}

		const internship = new Internship(internshipData);
		await internship.save();

		res.status(201).json({
			success: true,
			message: `Internship ${isPublished === "true" ? "published" : "saved as draft"} successfully`,
			internship: {
				...internship.toObject(),
				applicationCount: 0,
			},
		});
	} catch (error) {
		console.error("Create internship error:", error);

		if (error.name === "ValidationError") {
			const errors = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors,
			});
		}

		res.status(500).json({
			success: false,
			message: "Failed to create internship",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get internship details for organizer
exports.getInternshipDetails = async (req, res) => {
	try {
		const internship = await Internship.findOne({
			_id: req.params.id,
			organizer: req.user._id,
		});

		if (!internship) {
			return res.status(404).json({
				success: false,
				message: "Internship not found or you do not have permission",
			});
		}

		// Get application count
		const applicationCount = await InternshipApplication.countDocuments({
			internship: req.params.id,
			status: { $in: ["pending", "accepted", "rejected"] },
		});

		res.status(200).json({
			success: true,
			internship: {
				...internship.toObject(),
				applicationCount,
			},
		});
	} catch (error) {
		console.error("Get internship details error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch internship details",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Update an internship
exports.updateInternship = async (req, res) => {
	try {
		const internship = await Internship.findOne({
			_id: req.params.id,
			organizer: req.user._id,
		});

		if (!internship) {
			return res.status(404).json({
				success: false,
				message: "Internship not found or you do not have permission",
			});
		}

		const {
			title,
			companyName,
			shortDescription,
			description,
			type,
			category,
			applicationDeadline,
			startDate,
			location,
			compensation,
			duration,
			skills,
			requirements,
			responsibilities,
			benefits,
			isPublished,
		} = req.body;

		// Parse JSON fields
		let parsedLocation,
			parsedCompensation,
			parsedSkills,
			parsedRequirements,
			parsedResponsibilities,
			parsedBenefits;

		try {
			parsedLocation = typeof location === "string" ? JSON.parse(location) : location;
			parsedCompensation = typeof compensation === "string" ? JSON.parse(compensation) : compensation;
			parsedSkills = typeof skills === "string" ? JSON.parse(skills) : skills || [];
			parsedRequirements = typeof requirements === "string" ? JSON.parse(requirements) : requirements || [];
			parsedResponsibilities =
				typeof responsibilities === "string" ? JSON.parse(responsibilities) : responsibilities || [];
			parsedBenefits = typeof benefits === "string" ? JSON.parse(benefits) : benefits || [];
		} catch (parseError) {
			return res.status(400).json({
				success: false,
				message: "Invalid JSON data provided",
			});
		}

		const updateData = {
			title,
			companyName,
			shortDescription,
			description,
			type,
			category,
			applicationDeadline,
			startDate: startDate || null,
			location: parsedLocation,
			compensation: parsedCompensation,
			duration,
			skills: parsedSkills,
			requirements: parsedRequirements,
			responsibilities: parsedResponsibilities,
			benefits: parsedBenefits,
			isPublished: isPublished === "true" || isPublished === true,
			status: isPublished === "true" || isPublished === true ? "published" : "draft",
		};

		// If there's a new poster file
		if (req.file) {
			updateData.poster = req.file.path;

			// Delete old poster image from Cloudinary if it exists
			if (internship.poster && internship.poster !== req.file.path) {
				await replaceImage(internship.poster, req.file.path);
			}
		}

		const updatedInternship = await Internship.findByIdAndUpdate(req.params.id, updateData, {
			new: true,
			runValidators: true,
		});

		// Get application count
		const applicationCount = await InternshipApplication.countDocuments({
			internship: req.params.id,
			status: { $in: ["pending", "accepted", "rejected"] },
		});

		res.status(200).json({
			success: true,
			message: "Internship updated successfully",
			internship: {
				...updatedInternship.toObject(),
				applicationCount,
			},
		});
	} catch (error) {
		console.error("Update internship error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to update internship",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Delete an internship
exports.deleteInternship = async (req, res) => {
	try {
		const internship = await Internship.findOne({
			_id: req.params.id,
			organizer: req.user._id,
		});

		if (!internship) {
			return res.status(404).json({
				success: false,
				message: "Internship not found or you do not have permission",
			});
		}

		// Delete internship applications
		await InternshipApplication.deleteMany({ internship: req.params.id });

		// Delete internship
		await Internship.findByIdAndDelete(req.params.id);

		// Delete poster image from Cloudinary if it exists
		if (internship.poster) {
			await deleteImage(internship.poster);
		}

		res.status(200).json({
			success: true,
			message: "Internship deleted successfully",
		});
	} catch (error) {
		console.error("Delete internship error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete internship",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

// Get applicants list for a specific internship
exports.getInternshipApplicants = async (req, res) => {
	try {
		const internship = await Internship.findOne({
			_id: req.params.id,
			organizer: req.user._id,
		});

		if (!internship) {
			return res.status(404).json({
				success: false,
				message: "Internship not found or you do not have permission",
			});
		}

		// Get applications with user details
		const applicants = await InternshipApplication.find({
			internship: req.params.id,
		})
			.populate("user", "name email profilePicture")
			.sort({ applicationDate: -1 });

		res.status(200).json({
			success: true,
			count: applicants.length,
			applicants: applicants.map((app) => ({
				id: app._id,
				userId: app.user._id,
				name: app.user.name,
				email: app.user.email,
				profilePicture: app.user.profilePicture,
				applicationDate: app.applicationDate,
				status: app.status,
				coverLetter: app.coverLetter,
				resume: app.resume,
			})),
		});
	} catch (error) {
		console.error("Get internship applicants error:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch applicants",
			error: process.env.NODE_ENV === "development" ? error.message : null,
		});
	}
};

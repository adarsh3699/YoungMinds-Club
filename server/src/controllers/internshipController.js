const Internship = require("../models/Internship");
const InternshipApplication = require("../models/InternshipApplication");
const UserActivity = require("../models/UserActivity");
const User = require("../models/User");
const mongoose = require("mongoose");
const { deleteImage } = require("../utils/cloudinary");
const { sendInternshipApplicationEmail } = require("../services/emailService");

// Get all internships with pagination and filters
exports.getAllInternships = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		// Build filter object based on query params
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const filter = {
			// Only show published and non-flagged internships to public
			isPublished: true,
			isFlagged: false,
			status: "published",
			// Don't show internships with application deadlines older than 7 days
			applicationDeadline: { $gte: sevenDaysAgo },
		};

		// Filter by category
		if (req.query.category) {
			filter.category = req.query.category;
		}

		// Filter by type
		if (req.query.type) {
			filter.type = req.query.type;
		}

		// Filter by compensation type
		if (req.query.compensation) {
			filter["compensation.type"] = req.query.compensation;
		}

		// Filter by duration
		if (req.query.duration) {
			filter.duration = req.query.duration;
		}

		// Filter by location type
		if (req.query.locationType) {
			filter["location.type"] = req.query.locationType;
		}

		// Filter by date range (start date)
		if (req.query.startDate || req.query.endDate) {
			filter.startDate = {};

			if (req.query.startDate) {
				filter.startDate.$gte = new Date(req.query.startDate);
			}

			if (req.query.endDate) {
				filter.startDate.$lte = new Date(req.query.endDate);
			}
		}

		// Filter by city
		if (req.query.city) {
			filter["location.city"] = new RegExp(req.query.city, "i");
		}

		// Filter by remote only
		if (req.query.remote === "true") {
			filter["location.type"] = "remote";
		}

		// Filter by compensation amount range
		if (req.query.minAmount || req.query.maxAmount) {
			filter["compensation.amount"] = {};

			if (req.query.minAmount) {
				filter["compensation.amount"].$gte = parseInt(req.query.minAmount);
			}

			if (req.query.maxAmount) {
				filter["compensation.amount"].$lte = parseInt(req.query.maxAmount);
			}
		}

		// Search by text (title, skills, company name, benefits)
		if (req.query.search) {
			const searchRegex = new RegExp(req.query.search, "i");
			filter.$or = [
				{ title: searchRegex },
				{ companyName: searchRegex },
				{ skills: searchRegex },
				{ benefits: searchRegex },
				{ "location.city": searchRegex },
			];
		}

		// Filter by specific skill
		if (req.query.skill) {
			filter.skills = req.query.skill;
		}

		// Filter by featured status
		if (req.query.featured === "true") {
			filter.isFeatured = true;
			// Only show internships with future application deadlines when filtering for featured, but respect the 7-day minimum
			const now = new Date();
			const finalDeadline = now > sevenDaysAgo ? now : sevenDaysAgo;
			filter.applicationDeadline.$gte = finalDeadline;
		}

		// Sort options
		let sortOptions = { createdAt: -1 }; // Default: newest first

		// For featured internships, prioritize by application deadline (soonest first)
		if (req.query.featured === "true") {
			sortOptions = { applicationDeadline: 1 };
		} else if (req.query.sort) {
			switch (req.query.sort) {
				case "deadline":
					sortOptions = { applicationDeadline: 1 };
					break;
				case "popular":
					sortOptions = { applicationCount: -1 };
					break;
				case "amount":
					sortOptions = { "compensation.amount": -1 };
					break;
				case "startDate":
					sortOptions = { startDate: 1 };
					break;
				default:
					sortOptions = { createdAt: -1 };
			}
		}

		const internships = await Internship.find(filter)
			.sort(sortOptions)
			.skip(skip)
			.limit(limit)
			.populate("organizerId", "name email organizationName organizerBrandLogo");

		const total = await Internship.countDocuments(filter);

		res.status(200).json({
			success: true,
			count: internships.length,
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			internships,
		});
	} catch (error) {
		console.error("Error getting internships:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get a single internship by ID
exports.getInternshipById = async (req, res) => {
	try {
		const internship = await Internship.findById(req.params.id).populate(
			"organizerId",
			"name email organizationName organizerBrandLogo website description bio socialLinks"
		);

		if (!internship) {
			return res.status(404).json({
				success: false,
				message: "Internship not found",
			});
		}

		// Prepare response data
		let responseData = {
			success: true,
			internship,
		};

		// Add user status if user is authenticated
		if (req.user) {
			const userId = req.user.id;

			// Check if user has applied for this internship
			const hasApplied = await InternshipApplication.findOne({
				user: userId,
				internship: req.params.id,
			});

			// Check if user has saved this internship
			const UserActivity = require("../models/UserActivity");
			const userActivity = await UserActivity.findOne({ user: userId });
			const hasSaved = userActivity?.savedInternships?.includes(req.params.id) || false;

			responseData.userStatus = {
				isApplied: !!hasApplied,
				isSaved: hasSaved,
			};
		}

		// Check access permissions for non-public internships
		const isPublicAccess = internship.isPublished && !internship.isFlagged && internship.status === "published";

		if (isPublicAccess) {
			return res.status(200).json(responseData);
		}

		// For draft or flagged internships, check user permissions
		if (!req.user) {
			return res.status(404).json({
				success: false,
				message: "Internship not found",
			});
		}

		// Allow admin to view any internship
		if (req.user.role === "admin") {
			return res.status(200).json(responseData);
		}

		// Allow company/recruiter to view their own internships
		if (req.user.role === "organizer" && internship.organizerId._id.toString() === req.user._id.toString()) {
			return res.status(200).json(responseData);
		}

		// For all other cases, deny access
		return res.status(404).json({
			success: false,
			message: "Internship not found",
		});
	} catch (error) {
		console.error("Error getting internship:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Create a new internship (organizer or admin only)
exports.createInternship = async (req, res) => {
	try {
		// Add the current user as the organizer
		req.body.organizerId = req.user.id;

		const internship = await Internship.create(req.body);

		res.status(201).json({
			success: true,
			message: "Internship created successfully",
			internship,
		});
	} catch (error) {
		console.error("Error creating internship:", error);
		res.status(400).json({
			success: false,
			message: "Internship creation failed",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Apply for an internship
exports.applyForInternship = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { internshipId } = req.params;
		const userId = req.user.id;

		// Get the internship
		const internship = await Internship.findById(internshipId).session(session);

		if (!internship) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({
				success: false,
				message: "Internship not found",
			});
		}

		// Check if internship is still accepting applications
		if (internship.status !== "published") {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: "This internship is no longer accepting applications",
			});
		}

		// Check if application deadline has passed
		if (new Date() > internship.applicationDeadline) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: "Application deadline has passed",
			});
		}

		// Note: We don't limit applications based on capacity.
		// Capacity represents the number of positions to be filled, not the limit on applications.
		// Organizers can review all applications and select the best candidates.

		// Check if user has already applied
		const existingApplication = await InternshipApplication.findOne({
			user: userId,
			internship: internshipId,
		}).session(session);

		if (existingApplication) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: "You have already applied for this internship",
			});
		}

		// Create the application
		const applicationData = {
			user: userId,
			internship: internshipId,
			coverLetter: req.body.coverLetter,
			resume: req.body.resume,
			portfolio: req.body.portfolio,
			additionalInfo: req.body.additionalInfo,
		};

		const application = await InternshipApplication.create([applicationData], { session });

		// Award XP for applying
		const xpAwarded = 15; // XP for applying to internship

		// Get or create user activity record for XP tracking
		let userActivity = await UserActivity.findOne({ user: userId }).session(session);

		if (!userActivity) {
			userActivity = new UserActivity({
				user: userId,
			});
		}

		// Get internship details for description
		const internshipForDescription = await Internship.findById(internshipId).session(session);

		// Add XP for application with proper tracking
		await userActivity.addXP(
			xpAwarded,
			"internship_application",
			`Applied for internship: ${internshipForDescription?.title || "Internship"}`,
			application[0]._id,
			"InternshipApplication"
		);

		// Update application with XP awarded
		application[0].xpAwarded = xpAwarded;
		await application[0].save({ session });

		await session.commitTransaction();
		session.endSession();

		// Send internship application confirmation email (non-blocking)
		try {
			const user = await User.findById(userId);
			if (user) {
				// Format internship details for email
				const internshipDetails = {
					id: internship._id,
					title: internship.title,
					category: internship.category,
					companyName: internship.companyName,
					duration: internship.duration || "TBD",
					applicationDeadline: internship.applicationDeadline
						? new Date(internship.applicationDeadline).toLocaleDateString()
						: "TBD",
				};

				await sendInternshipApplicationEmail(user.email, user.name, internshipDetails, user._id);
				console.log(`Internship application email sent to ${user.email} for internship: ${internship.title}`);
			}
		} catch (emailError) {
			console.error("Internship application email failed:", emailError);
			// Don't fail application if email fails
		}

		res.status(200).json({
			success: true,
			message: "Successfully applied for internship",
			xp: xpAwarded,
			application: application[0],
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();

		console.error("Error applying for internship:", error);

		// Handle duplicate application error
		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				message: "You have already applied for this internship",
			});
		}

		res.status(500).json({
			success: false,
			message: "Application failed",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Save/unsave an internship
exports.saveInternship = async (req, res) => {
	try {
		const { internshipId } = req.params;
		const userId = req.user.id;

		// Get user activity
		let userActivity = await UserActivity.findOne({ user: userId });

		if (!userActivity) {
			userActivity = await UserActivity.create({
				user: userId,
				savedInternships: [internshipId],
			});

			return res.status(200).json({
				success: true,
				message: "Internship saved successfully",
				isSaved: true,
			});
		}

		// Initialize savedInternships if it doesn't exist
		if (!userActivity.savedInternships) {
			userActivity.savedInternships = [];
		}

		// Check if internship is already saved
		const savedIndex = userActivity.savedInternships.indexOf(internshipId);

		if (savedIndex > -1) {
			// Remove from saved
			userActivity.savedInternships.splice(savedIndex, 1);
			await userActivity.save();

			return res.status(200).json({
				success: true,
				message: "Internship removed from saved",
				isSaved: false,
			});
		} else {
			// Add to saved
			userActivity.savedInternships.push(internshipId);
			await userActivity.save();

			return res.status(200).json({
				success: true,
				message: "Internship saved successfully",
				isSaved: true,
			});
		}
	} catch (error) {
		console.error("Error saving internship:", error);
		res.status(500).json({
			success: false,
			message: "Failed to save internship",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Update an internship (company/admin only)
exports.updateInternship = async (req, res) => {
	try {
		const internship = await Internship.findById(req.params.id);

		if (!internship) {
			return res.status(404).json({
				success: false,
				message: "Internship not found",
			});
		}

		// Check permissions
		if (req.user.role !== "admin" && internship.organizerId.toString() !== req.user.id) {
			return res.status(403).json({
				success: false,
				message: "Not authorized to update this internship",
			});
		}

		const updatedInternship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		res.status(200).json({
			success: true,
			message: "Internship updated successfully",
			internship: updatedInternship,
		});
	} catch (error) {
		console.error("Error updating internship:", error);
		res.status(400).json({
			success: false,
			message: "Failed to update internship",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Delete an internship (company/admin only)
exports.deleteInternship = async (req, res) => {
	let session;
	try {
		const internship = await Internship.findById(req.params.id);

		if (!internship) {
			return res.status(404).json({
				success: false,
				message: "Internship not found",
			});
		}

		// Check permissions
		if (req.user.role !== "admin" && internship.organizerId.toString() !== req.user.id) {
			return res.status(403).json({
				success: false,
				message: "Not authorized to delete this internship",
			});
		}

		// Start transaction
		session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Get all applications first to delete their attached files
			const applications = await InternshipApplication.find({ internship: req.params.id }).session(session);

			// Delete resume and portfolio files from Cloudinary if they exist
			for (const application of applications) {
				if (application.resume) {
					try {
						await deleteImage(application.resume);
					} catch (error) {
						console.error("Error deleting resume file:", error);
					}
				}
				if (application.portfolio) {
					try {
						await deleteImage(application.portfolio);
					} catch (error) {
						console.error("Error deleting portfolio file:", error);
					}
				}
			}

			// Delete the internship poster if it exists
			if (internship.poster) {
				try {
					await deleteImage(internship.poster);
				} catch (error) {
					console.error("Error deleting internship poster:", error);
				}
			}

			// Delete the internship
			await Internship.findByIdAndDelete(req.params.id).session(session);

			// Delete all applications for this internship
			await InternshipApplication.deleteMany({ internship: req.params.id }).session(session);

			// Remove this internship from all users' saved internships lists
			await UserActivity.updateMany(
				{ savedInternships: req.params.id },
				{ $pull: { savedInternships: req.params.id } }
			).session(session);

			// Commit the transaction
			await session.commitTransaction();

			res.status(200).json({
				success: true,
				message: "Internship and all related data deleted successfully",
			});
		} catch (error) {
			// Rollback the transaction on error
			await session.abortTransaction();
			throw error;
		}
	} catch (error) {
		console.error("Error deleting internship:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete internship",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	} finally {
		// End session if it was started
		if (session) {
			session.endSession();
		}
	}
};

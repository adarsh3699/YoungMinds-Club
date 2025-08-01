const Event = require("../models/Event");
const UserActivity = require("../models/UserActivity");
const mongoose = require("mongoose");

// Get all events with pagination and filters
exports.getAllEvents = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		// Build filter object based on query params
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const filter = {
			// Only show published and non-flagged events to public
			isPublished: true,
			isFlagged: false,
			// Don't show events older than 7 days
			date: { $gte: sevenDaysAgo },
		};

		// Filter by category
		if (req.query.category) {
			filter.category = req.query.category;
		}

		// Filter by date range
		if (req.query.startDate || req.query.endDate) {
			// Ensure we maintain the 7-day minimum filter
			const startDate = req.query.startDate ? new Date(req.query.startDate) : sevenDaysAgo;
			const finalStartDate = startDate > sevenDaysAgo ? startDate : sevenDaysAgo;

			filter.date.$gte = finalStartDate;

			if (req.query.endDate) {
				filter.date.$lte = new Date(req.query.endDate);
			}
		}

		// Filter by city
		if (req.query.city) {
			filter["location.city"] = new RegExp(req.query.city, "i");
		}

		// Search by text (title, tags, city)
		if (req.query.search) {
			const searchRegex = new RegExp(req.query.search, "i");
			filter.$or = [{ title: searchRegex }, { tags: searchRegex }, { "location.city": searchRegex }];
		}

		// Filter by specific tag
		if (req.query.tag) {
			filter.tags = req.query.tag;
		}

		// Filter by featured status
		if (req.query.featured === "true") {
			filter.isFeatured = true;
			// Only show upcoming events when filtering for featured, but respect the 7-day minimum
			const now = new Date();
			const finalStartDate = now > sevenDaysAgo ? now : sevenDaysAgo;
			filter.date.$gte = finalStartDate;
		}

		// Use aggregation to sort upcoming events first, then ended events
		const currentDate = new Date();
		const isFeaturedQuery = req.query.featured === "true";

		const eventsResult = await Event.aggregate([
			{ $match: filter },
			{
				$addFields: {
					isUpcoming: { $gte: ["$date", currentDate] },
				},
			},
			{
				$sort: isFeaturedQuery
					? { date: 1 } // For featured events, sort by date (soonest first)
					: {
							isUpcoming: -1, // Upcoming events first (true = 1, false = 0, so -1 puts true first)
							createdAt: -1, // Then by creation date descending (newest first)
					  },
			},
			{ $skip: skip },
			{ $limit: limit },
			{
				$lookup: {
					from: "users",
					localField: "organizer",
					foreignField: "_id",
					as: "organizer",
					pipeline: [{ $project: { name: 1, email: 1 } }],
				},
			},
			{
				$addFields: {
					organizer: { $arrayElemAt: ["$organizer", 0] },
				},
			},
			{ $unset: "isUpcoming" }, // Remove the helper field from final output
		]);

		const events = eventsResult;

		const total = await Event.countDocuments(filter);

		res.status(200).json({
			success: true,
			count: events.length,
			total,
			totalPages: Math.ceil(total / limit),
			currentPage: page,
			events,
		});
	} catch (error) {
		console.error("Error getting events:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
	try {
		// First, try to find the event without any visibility restrictions
		const event = await Event.findById(req.params.id).populate("organizer", "name email");

		if (!event) {
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}

		// Check if the event is published and not flagged (public access)
		if (event.isPublished && !event.isFlagged) {
			return res.status(200).json({
				success: true,
				event,
			});
		}

		// For draft or flagged events, check user permissions
		// If user is not authenticated, they can't view draft/flagged events
		if (!req.user) {
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}

		// Allow admin to view any event
		if (req.user.role === "admin") {
			return res.status(200).json({
				success: true,
				event,
			});
		}

		// Allow organizer to view their own events (even if draft or flagged)
		if (req.user.role === "organizer" && event.organizer._id.toString() === req.user._id.toString()) {
			return res.status(200).json({
				success: true,
				event,
			});
		}

		// For all other cases, deny access
		return res.status(404).json({
			success: false,
			message: "Event not found",
		});
	} catch (error) {
		console.error("Error getting event:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Create a new event (organizer or admin only)
exports.createEvent = async (req, res) => {
	try {
		// Add the current user as the organizer
		req.body.organizer = req.user.id;

		const event = await Event.create(req.body);

		res.status(201).json({
			success: true,
			message: "Event created successfully",
			event,
		});
	} catch (error) {
		console.error("Error creating event:", error);
		res.status(400).json({
			success: false,
			message: "Event creation failed",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Register for an event
exports.registerForEvent = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { eventId } = req.params;
		const userId = req.user.id;

		// Get the event
		const event = await Event.findById(eventId).session(session);

		if (!event) {
			await session.abortTransaction();
			session.endSession();
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}

		// Check if event is at full capacity
		if (event.registrationCount >= event.capacity) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: "Event has reached maximum capacity",
			});
		}

		// Get or create user activity record
		let userActivity = await UserActivity.findOne({ user: userId }).session(session);

		if (!userActivity) {
			userActivity = new UserActivity({
				user: userId,
			});
		}

		// Check if user is already registered
		const alreadyRegistered = userActivity.registeredEvents.some((reg) => reg.event.toString() === eventId);

		if (alreadyRegistered) {
			await session.abortTransaction();
			session.endSession();
			return res.status(400).json({
				success: false,
				message: "You are already registered for this event",
			});
		}

		// Add event to registered events
		userActivity.registeredEvents.push({
			event: eventId,
			registeredAt: new Date(),
		});

		// Add XP for registration
		await userActivity.addXP(10);

		// Increment event registration count
		event.registrationCount += 1;
		await event.save({ session });

		await session.commitTransaction();
		session.endSession();

		res.status(200).json({
			success: true,
			message: "Successfully registered for the event",
			xp: userActivity.xp,
			badge: userActivity.badge,
		});
	} catch (error) {
		await session.abortTransaction();
		session.endSession();

		console.error("Error registering for event:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Save an event for later
exports.saveEvent = async (req, res) => {
	try {
		const { eventId } = req.params;
		const userId = req.user.id;

		// Check if event exists
		const event = await Event.findById(eventId);

		if (!event) {
			return res.status(404).json({
				success: false,
				message: "Event not found",
			});
		}

		// Get or create user activity record
		let userActivity = await UserActivity.findOne({ user: userId });

		if (!userActivity) {
			userActivity = new UserActivity({
				user: userId,
			});
		}

		// Check if event is already saved
		const alreadySaved = userActivity.savedEvents.some((saved) => saved.event.toString() === eventId);

		if (alreadySaved) {
			// Remove from saved events if already saved
			userActivity.savedEvents = userActivity.savedEvents.filter((saved) => saved.event.toString() !== eventId);

			await userActivity.save();

			return res.status(200).json({
				success: true,
				message: "Event removed from saved events",
				isSaved: false,
			});
		}

		// Add event to saved events
		userActivity.savedEvents.push({
			event: eventId,
			savedAt: new Date(),
		});

		await userActivity.save();

		res.status(200).json({
			success: true,
			message: "Event saved successfully",
			isSaved: true,
		});
	} catch (error) {
		console.error("Error saving event:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Submit feedback for an event and earn XP
exports.submitFeedback = async (req, res) => {
	try {
		const { eventId } = req.params;
		const userId = req.user.id;
		const { rating, comment } = req.body;

		// Validate input
		if (!rating || rating < 1 || rating > 5) {
			return res.status(400).json({
				success: false,
				message: "Please provide a valid rating between 1 and 5",
			});
		}

		// Get user activity record
		const userActivity = await UserActivity.findOne({ user: userId });

		if (!userActivity) {
			return res.status(400).json({
				success: false,
				message: "User has no activity record",
			});
		}

		// Find the registered event
		const registeredEventIndex = userActivity.registeredEvents.findIndex((reg) => reg.event.toString() === eventId);

		if (registeredEventIndex === -1) {
			return res.status(400).json({
				success: false,
				message: "You must be registered for this event to submit feedback",
			});
		}

		// Check if feedback already given
		if (userActivity.registeredEvents[registeredEventIndex].feedback.given) {
			return res.status(400).json({
				success: false,
				message: "You have already submitted feedback for this event",
			});
		}

		// Update the feedback
		userActivity.registeredEvents[registeredEventIndex].feedback = {
			given: true,
			rating,
			comment,
			givenAt: new Date(),
		};

		// Add XP for giving feedback
		await userActivity.addXP(5);

		res.status(200).json({
			success: true,
			message: "Feedback submitted successfully",
			xp: userActivity.xp,
			badge: userActivity.badge,
		});
	} catch (error) {
		console.error("Error submitting feedback:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get recommended events (based on user activity)
exports.getRecommendedEvents = async (req, res) => {
	try {
		const userId = req.user.id;

		// Get user activity to analyze interests (for a real recommender, we'd use more sophisticated logic)
		const userActivity = await UserActivity.findOne({ user: userId }).populate("registeredEvents.event");

		// For now, we'll use a simplified approach (random events as placeholder)
		// In a real system, you'd use tags, categories, and past registrations to find similar events

		let recommendedEvents = await Event.find({
			date: { $gte: new Date() }, // Only future events
			// Only show published and non-flagged events
			isPublished: true,
			isFlagged: false,
		})
			.sort({
				date: 1, // Closest upcoming events first
				createdAt: -1, // Then newest first
			})
			.limit(6)
			.populate("organizer", "name");

		// If user has activity, we can do slightly better recommendations
		if (userActivity && userActivity.registeredEvents.length > 0) {
			// Extract categories and tags from user's registered events
			const userEvents = userActivity.registeredEvents.map((reg) => reg.event).filter(Boolean); // Filter out null/undefined events
			const userCategories = [...new Set(userEvents.map((event) => event.category).filter(Boolean))];
			const userTags = [...new Set(userEvents.flatMap((event) => event.tags || []))];

			// If we have categories or tags, use them to find similar events
			if (userCategories.length > 0 || userTags.length > 0) {
				const filter = {
					date: { $gte: new Date() },
				};

				if (userCategories.length > 0) {
					filter.category = { $in: userCategories };
				}

				if (userTags.length > 0) {
					filter.tags = { $in: userTags };
				}

				// Exclude events user is already registered for (only include valid events)
				const registeredEventIds = userActivity.registeredEvents
					.filter((reg) => reg.event && reg.event._id) // Filter out null events
					.map((reg) => reg.event._id.toString());

				if (registeredEventIds.length > 0) {
					filter._id = { $nin: registeredEventIds };
				}

				const similarEvents = await Event.find(filter)
					.sort({
						date: 1, // Closest upcoming events first
						createdAt: -1, // Then newest first
					})
					.limit(6)
					.populate("organizer", "name");

				if (similarEvents.length > 0) {
					recommendedEvents = similarEvents;
				}
			}
		}

		res.status(200).json({
			success: true,
			count: recommendedEvents.length,
			events: recommendedEvents,
		});
	} catch (error) {
		console.error("Error getting recommended events:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

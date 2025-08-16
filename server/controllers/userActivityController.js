const UserActivity = require("../models/UserActivity");
const EventRegistration = require("../models/EventRegistration");
const InternshipApplication = require("../models/InternshipApplication");
const Event = require("../models/Event");

// Get user's profile with XP and badge
exports.getUserProfile = async (req, res) => {
	try {
		const userId = req.user.id;

		// Find or create user activity
		let userActivity = await UserActivity.findOne({ user: userId });

		if (!userActivity) {
			userActivity = await UserActivity.create({ user: userId });
		}

		// Ensure badge is correctly set based on current XP
		let currentBadge = "Newbie";
		if (userActivity.xp >= 500) {
			currentBadge = "Master";
		} else if (userActivity.xp >= 300) {
			currentBadge = "Veteran";
		} else if (userActivity.xp >= 150) {
			currentBadge = "Champ";
		} else if (userActivity.xp >= 50) {
			currentBadge = "Regular";
		}

		// Update badge if it's not correctly set
		if (userActivity.badge !== currentBadge) {
			userActivity.badge = currentBadge;
			await userActivity.save();
		}

		res.status(200).json({
			success: true,
			profile: {
				xp: userActivity.xp,
				badge: userActivity.badge,
				streakCount: userActivity.streakCount,
			},
		});
	} catch (error) {
		console.error("Error getting user profile:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get user's registered events
exports.getRegisteredEvents = async (req, res) => {
	try {
		const userId = req.user.id;

		const eventRegistrations = await EventRegistration.find({ user: userId })
			.populate({
				path: "event",
				populate: {
					path: "organizer",
					select: "name",
				},
			})
			.sort({ registrationDate: -1 });

		// Extract and format registered events
		const registeredEvents = eventRegistrations
			.filter((registration) => registration.event) // Filter out any null references
			.map((registration) => ({
				...registration.event.toObject(),
				registrationId: registration._id,
				registeredAt: registration.registrationDate,
				status: registration.status,
				attended: registration.checkIn.checkedIn,
				feedback: {
					given: registration.feedback.submitted,
					rating: registration.feedback.rating,
					comment: registration.feedback.comment,
				},
			}));

		res.status(200).json({
			success: true,
			count: registeredEvents.length,
			registeredEvents,
		});
	} catch (error) {
		console.error("Error getting registered events:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get leaderboard (top users by XP)
exports.getLeaderboard = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 10;

		// Get leaderboard data with user info
		const leaderboard = await UserActivity.find()
			.sort({ xp: -1 }) // Sort by XP descending
			.limit(limit)
			.populate("user", "name profilePicture")
			.select("user xp badge streakCount -_id");

		// Format response data
		const formattedLeaderboard = leaderboard
			.filter((item) => item.user) // Filter out entries with missing user data
			.map((item) => ({
				_id: item.user._id,
				name: item.user.name,
				profilePicture: item.user.profilePicture,
				xp: item.xp,
				badge: item.badge,
				streakCount: item.streakCount,
			}));

		res.status(200).json({
			success: true,
			count: formattedLeaderboard.length,
			leaderboard: formattedLeaderboard,
		});
	} catch (error) {
		console.error("Error getting leaderboard:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get user's events and activity data
exports.getUserEvents = async (req, res) => {
	try {
		const userId = req.user.id;

		// Get user activity for XP and badge info
		let userActivity = await UserActivity.findOne({ user: userId }).populate({
			path: "savedEvents.event",
			select: "title shortDescription poster date location type",
		});

		if (!userActivity) {
			userActivity = await UserActivity.create({ user: userId });
		}

		// Get user's registered events from EventRegistration model
		const eventRegistrations = await EventRegistration.find({ user: userId })
			.populate({
				path: "event",
				select: "title shortDescription poster date location type",
			})
			.sort({ registrationDate: -1 });

		// Format saved events
		const savedEvents = userActivity.savedEvents
			.filter((item) => item.event)
			.map((item) => ({
				id: item.event._id,
				_id: item.event._id,
				title: item.event.title,
				shortDescription: item.event.shortDescription,
				poster: item.event.poster,
				date: item.event.date,
				location: item.event.location,
				type: item.event.type,
				savedAt: item.savedAt,
			}));

		// Format registered events
		const registeredEvents = eventRegistrations
			.filter((registration) => registration.event)
			.map((registration) => ({
				id: registration.event._id,
				_id: registration.event._id,
				title: registration.event.title,
				shortDescription: registration.event.shortDescription,
				poster: registration.event.poster,
				date: registration.event.date,
				location: registration.event.location,
				type: registration.event.type,
				registeredAt: registration.registrationDate,
				attended: registration.checkIn.checkedIn,
				feedback: {
					given: registration.feedback.submitted,
					rating: registration.feedback.rating,
					comment: registration.feedback.comment,
					givenAt: registration.feedback.submittedAt,
				},
			}));

		res.status(200).json({
			success: true,
			xp: userActivity.xp,
			badge: userActivity.badge,
			savedEvents,
			events: registeredEvents,
			streakCount: userActivity.streakCount,
		});
	} catch (error) {
		console.error("Error getting user events:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get XP history for the current user
exports.getXPHistory = async (req, res) => {
	try {
		const userId = req.user.id;

		const userActivity = await UserActivity.findOne({ user: userId }).populate({
			path: "xpHistory.referenceId",
			refPath: "xpHistory.referenceModel",
		});

		if (!userActivity) {
			return res.status(200).json({
				success: true,
				xpHistory: [],
			});
		}

		// Format XP history from the new xpHistory field
		const xpHistory = userActivity.xpHistory
			.map((entry) => ({
				_id: entry._id,
				date: entry.earnedAt,
				description: entry.description,
				amount: entry.amount,
				type: entry.type,
			}))
			.sort((a, b) => new Date(b.date) - new Date(a.date));

		res.status(200).json({
			success: true,
			xpHistory,
		});
	} catch (error) {
		console.error("Error getting XP history:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

// Get user's badges
exports.getUserBadges = async (req, res) => {
	try {
		const userId = req.user.id;

		const userActivity = await UserActivity.findOne({ user: userId });

		if (!userActivity) {
			return res.status(200).json({
				success: true,
				badges: [],
			});
		}

		// Return all unlocked badges based on XP milestones
		const badges = [];

		// Always have Newbie badge
		badges.push({
			name: "Newbie",
			description: "Welcome to YMC!",
			icon: "🌱",
			unlocked: true,
			unlockedAt: userActivity.createdAt,
		});

		if (userActivity.xp >= 50) {
			badges.push({
				name: "Regular",
				description: "Active community member",
				icon: "⭐",
				unlocked: true,
				unlockedAt: userActivity.updatedAt,
			});
		}

		if (userActivity.xp >= 150) {
			badges.push({
				name: "Champ",
				description: "Event enthusiast",
				icon: "🏆",
				unlocked: true,
				unlockedAt: userActivity.updatedAt,
			});
		}

		if (userActivity.xp >= 300) {
			badges.push({
				name: "Veteran",
				description: "Community leader",
				icon: "🎖️",
				unlocked: true,
				unlockedAt: userActivity.updatedAt,
			});
		}

		if (userActivity.xp >= 500) {
			badges.push({
				name: "Master",
				description: "YMC expert",
				icon: "👑",
				unlocked: true,
				unlockedAt: userActivity.updatedAt,
			});
		}

		res.status(200).json({
			success: true,
			badges,
		});
	} catch (error) {
		console.error("Error getting user badges:", error);
		res.status(500).json({
			success: false,
			message: "Server error",
			error: process.env.NODE_ENV === "development" ? error.message : undefined,
		});
	}
};

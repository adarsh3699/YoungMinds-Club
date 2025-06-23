const User = require('../models/User');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const UserActivity = require('../models/UserActivity');
const Announcement = require('../models/Announcement');
const { cloudinary } = require('../config/cloudinary');
const { deleteImage, replaceImage } = require('../utils/cloudinary');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { filterEventUpdateFields } = require('../utils/eventHelpers');

// Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
	try {
		const totalUsers = await User.countDocuments();
		const totalOrganizers = await User.countDocuments({ role: 'organizer' });
		const totalEvents = await Event.countDocuments();
		const totalRegistrations = await EventRegistration.countDocuments();

		res.status(200).json({
			success: true,
			stats: {
				totalUsers,
				totalOrganizers,
				totalEvents,
				totalRegistrations,
			},
		});
	} catch (error) {
		console.error('Get dashboard stats error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch dashboard statistics',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get all users
exports.getAllUsers = async (req, res) => {
	try {
		const users = await User.find().select('-password');

		res.status(200).json({
			success: true,
			count: users.length,
			users,
		});
	} catch (error) {
		console.error('Get all users error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch users',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get all organizers with event counts
exports.getAllOrganizers = async (req, res) => {
	try {
		const organizers = await User.find({ role: 'organizer' }).select('-password');

		// Get event counts for each organizer
		const organizerIds = organizers.map((org) => org._id);
		const eventCounts = await Event.aggregate([
			{ $match: { organizer: { $in: organizerIds } } },
			{ $group: { _id: '$organizer', eventCount: { $sum: 1 } } },
		]);

		// Create a map of organizer ID to event count
		const eventCountMap = {};
		eventCounts.forEach((item) => {
			eventCountMap[item._id.toString()] = item.eventCount;
		});

		// Add event count to each organizer
		const organizersWithEventCount = organizers.map((organizer) => {
			const orgObj = organizer.toObject();
			orgObj.eventCount = eventCountMap[organizer._id.toString()] || 0;
			return orgObj;
		});

		res.status(200).json({
			success: true,
			count: organizers.length,
			organizers: organizersWithEventCount,
		});
	} catch (error) {
		console.error('Get all organizers error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch organizers',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get top organizers by event count or registrations
exports.getTopOrganizers = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 5;

		// Get all organizers
		const organizers = await User.find({ role: 'organizer' }).select('-password');
		const organizerIds = organizers.map((org) => org._id);

		// Aggregate event counts and registration counts for each organizer
		const eventData = await Event.aggregate([
			{ $match: { organizer: { $in: organizerIds } } },
			{ $lookup: { from: 'eventregistrations', localField: '_id', foreignField: 'event', as: 'registrations' } },
			{ $addFields: { registrationCount: { $size: '$registrations' } } },
			{
				$group: {
					_id: '$organizer',
					eventCount: { $sum: 1 },
					totalRegistrations: { $sum: '$registrationCount' },
				},
			},
			{ $sort: { eventCount: -1, totalRegistrations: -1 } },
			{ $limit: limit },
		]);

		// Create a map of organizer details
		const organizerMap = {};
		organizers.forEach((org) => {
			organizerMap[org._id.toString()] = {
				name: org.name,
				email: org.email,
				profilePicture: org.profilePicture,
				organizationName: org.organizationName,
			};
		});

		// Combine organizer details with event data
		const topOrganizers = eventData.map((item) => ({
			_id: item._id,
			eventCount: item.eventCount,
			totalRegistrations: item.totalRegistrations,
			...organizerMap[item._id.toString()],
			// Default rating between 3-5 (temporary, replace with actual rating logic)
			rating: Math.floor(Math.random() * 2) + 3,
		}));

		res.status(200).json({
			success: true,
			organizers: topOrganizers,
		});
	} catch (error) {
		console.error('Get top organizers error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch top organizers',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get single user
exports.getUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.status(200).json({
			success: true,
			user,
		});
	} catch (error) {
		console.error('Get user error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch user',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Update user role
exports.updateUserRole = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				errors: errors.array(),
			});
		}

		const { role } = req.body;

		// Check if role is valid
		if (!['user', 'organizer', 'admin'].includes(role)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid role. Role must be user, organizer, or admin',
			});
		}

		const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select(
			'-password'
		);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'User role updated successfully',
			user,
		});
	} catch (error) {
		console.error('Update user role error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update user role',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Update user status (suspend/activate)
exports.updateUserStatus = async (req, res) => {
	try {
		const { status } = req.body;

		// Check if status is valid
		if (!['active', 'suspended'].includes(status)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid status. Status must be active or suspended',
			});
		}

		const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).select(
			'-password'
		);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.status(200).json({
			success: true,
			message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`,
			user,
		});
	} catch (error) {
		console.error('Update user status error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update user status',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Flag or unflag a user
exports.toggleUserFlag = async (req, res) => {
	try {
		const { isFlagged, flagReason } = req.body;

		const updateData = { isFlagged, flagReason: '' };
		if (isFlagged && flagReason) {
			updateData.flagReason = flagReason;
		}

		const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select(
			'-password'
		);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		res.status(200).json({
			success: true,
			message: `User ${isFlagged ? 'flagged' : 'unflagged'} successfully`,
			user,
		});
	} catch (error) {
		console.error('Toggle user flag error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update user flag status',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Delete user
exports.deleteUser = async (req, res) => {
	try {
		const { deleteAllData } = req.body;
		const userId = req.params.id;

		// Find the user first to ensure they exist
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// Start a transaction for data consistency
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Delete the user
			await User.findByIdAndDelete(userId, { session });

			// If deleteAllData is true, also delete all associated data
			if (deleteAllData) {
				// Delete user's events
				const userEvents = await Event.find({ organizer: userId });
				const eventIds = userEvents.map((event) => event._id);

				// Delete registrations for their events
				if (eventIds.length > 0) {
					await EventRegistration.deleteMany({ event: { $in: eventIds } }, { session });
				}

				// Delete the events themselves
				await Event.deleteMany({ organizer: userId }, { session });

				// Delete user's own event registrations
				await EventRegistration.deleteMany({ user: userId }, { session });

				// Delete user activity
				await UserActivity.deleteMany({ user: userId }, { session });
			}

			// Commit the transaction
			await session.commitTransaction();
			session.endSession();

			res.status(200).json({
				success: true,
				message: deleteAllData ? 'User and all their data deleted successfully' : 'User deleted successfully',
			});
		} catch (error) {
			// If there's an error, abort the transaction
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	} catch (error) {
		console.error('Delete user error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete user',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get all events with organizer info
exports.getAllEvents = async (req, res) => {
	try {
		// Use aggregation to sort upcoming events first, then ended events
		const currentDate = new Date();
		const events = await Event.aggregate([
			{ $match: {} },
			{
				$addFields: {
					isUpcoming: { $gte: ['$date', currentDate] },
				},
			},
			{
				$sort: {
					isUpcoming: -1, // Upcoming events first
					createdAt: -1, // Then by creation date descending (newest first)
				},
			},
			{
				$lookup: {
					from: 'users',
					localField: 'organizer',
					foreignField: '_id',
					as: 'organizer',
					pipeline: [{ $project: { name: 1, email: 1 } }],
				},
			},
			{
				$addFields: {
					organizer: { $arrayElemAt: ['$organizer', 0] },
				},
			},
			{ $unset: 'isUpcoming' }, // Remove the helper field from final output
		]);

		res.status(200).json({
			success: true,
			count: events.length,
			events,
		});
	} catch (error) {
		console.error('Get all events error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch events',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Toggle event flag
exports.toggleEventFlag = async (req, res) => {
	try {
		const { isFlagged, flagReason } = req.body;

		const updateData = { isFlagged };
		if (isFlagged && flagReason) {
			updateData.flagReason = flagReason;
		}

		const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

		if (!event) {
			return res.status(404).json({
				success: false,
				message: 'Event not found',
			});
		}

		res.status(200).json({
			success: true,
			message: `Event ${isFlagged ? 'flagged' : 'unflagged'} successfully`,
			event,
		});
	} catch (error) {
		console.error('Toggle event flag error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update event flag status',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Toggle event feature
exports.toggleEventFeature = async (req, res) => {
	try {
		const { isFeatured } = req.body;

		const event = await Event.findByIdAndUpdate(req.params.id, { isFeatured }, { new: true, runValidators: true });

		if (!event) {
			return res.status(404).json({
				success: false,
				message: 'Event not found',
			});
		}

		res.status(200).json({
			success: true,
			message: `Event ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
			event,
		});
	} catch (error) {
		console.error('Toggle event feature error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update event feature status',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Delete event
exports.deleteEvent = async (req, res) => {
	try {
		const event = await Event.findById(req.params.id);

		if (!event) {
			return res.status(404).json({
				success: false,
				message: 'Event not found',
			});
		}

		// Delete poster image from Cloudinary if it exists
		if (event.poster) {
			await deleteImage(event.poster);
		}

		// Delete the event
		await Event.findByIdAndDelete(req.params.id);

		// Delete all registrations for this event
		await EventRegistration.deleteMany({ event: req.params.id });

		res.status(200).json({
			success: true,
			message: 'Event deleted successfully',
		});
	} catch (error) {
		console.error('Delete event error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete event',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Update event (Admin only)
exports.updateEvent = async (req, res) => {
	try {
		// Check if the event exists
		const event = await Event.findById(req.params.id);

		if (!event) {
			return res.status(404).json({
				success: false,
				message: 'Event not found',
			});
		}

		// Filter event update data (admin role)
		const updateData = filterEventUpdateFields(req.body, 'admin');

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
		}).populate('organizer', 'name email');

		res.status(200).json({
			success: true,
			message: 'Event updated successfully',
			event: updatedEvent,
		});
	} catch (error) {
		console.error('Admin update event error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update event',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get analytics
exports.getAnalytics = async (req, res) => {
	try {
		// Top 5 most registered events
		const topEvents = await EventRegistration.aggregate([
			{ $group: { _id: '$event', count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 5 },
		]);

		// Populate event details
		const eventIds = topEvents.map((item) => new mongoose.Types.ObjectId(item._id));
		const events = await Event.find({ _id: { $in: eventIds } }).select('title shortDescription');

		// Create a map of event ID to event details
		const eventMap = {};
		events.forEach((event) => {
			eventMap[event._id.toString()] = {
				title: event.title,
				shortDescription: event.shortDescription,
			};
		});

		// Add event details to top events
		const topEventDetails = topEvents.map((item) => ({
			_id: item._id,
			count: item.count,
			title: eventMap[item._id.toString()]?.title || 'Unknown Event',
			shortDescription: eventMap[item._id.toString()]?.shortDescription || 'No description available',
		}));

		// Top organizers based on total registrations for their events
		const topOrganizers = await Event.aggregate([
			{ $lookup: { from: 'eventregistrations', localField: '_id', foreignField: 'event', as: 'registrations' } },
			{ $addFields: { registrationCount: { $size: '$registrations' } } },
			{
				$group: {
					_id: '$organizer',
					totalRegistrations: { $sum: '$registrationCount' },
					eventCount: { $sum: 1 },
				},
			},
			{ $sort: { totalRegistrations: -1 } },
			{ $limit: 5 },
		]);

		// Populate organizer details
		const organizerIds = topOrganizers.map((item) => new mongoose.Types.ObjectId(item._id));
		const organizers = await User.find({ _id: { $in: organizerIds } }).select('name email');

		// Create a map of organizer ID to organizer details
		const organizerMap = {};
		organizers.forEach((org) => {
			organizerMap[org._id.toString()] = {
				name: org.name,
				email: org.email,
			};
		});

		// Add organizer details to top organizers
		const topOrganizerDetails = topOrganizers.map((item) => ({
			_id: item._id,
			totalRegistrations: item.totalRegistrations,
			eventCount: item.eventCount,
			name: organizerMap[item._id.toString()]?.name || 'Unknown Organizer',
			email: organizerMap[item._id.toString()]?.email || 'No email available',
		}));

		// Top users based on XP
		const topUserActivities = await UserActivity.find()
			.sort({ xp: -1 })
			.limit(10)
			.populate('user', 'name email')
			.select('xp badge streakCount');

		// Format user data
		const topUsers = topUserActivities.map((activity) => ({
			_id: activity._id,
			user: activity.user,
			xp: activity.xp,
			badges: [activity.badge], // Convert to array for frontend compatibility
			streak: activity.streakCount,
		}));

		res.status(200).json({
			success: true,
			analytics: {
				topEvents: topEventDetails,
				topOrganizers: topOrganizerDetails,
				topUsers,
			},
		});
	} catch (error) {
		console.error('Get analytics error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch analytics',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get flagged items (users or events)
exports.getFlaggedItems = async (req, res) => {
	try {
		const flaggedUsers = await User.find({ isFlagged: true }).select('-password');
		const flaggedEvents = await Event.find({ isFlagged: true })
			.sort({ createdAt: -1 })
			.populate('organizer', 'name email');

		res.status(200).json({
			success: true,
			flaggedItems: {
				users: flaggedUsers,
				events: flaggedEvents,
			},
		});
	} catch (error) {
		console.error('Get flagged items error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch flagged items',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
	try {
		const { title, message, type, expiresAt, link } = req.body;

		const announcement = await Announcement.create({
			title,
			message,
			type: type || 'info',
			link,
			expiresAt,
			createdBy: req.user._id,
		});

		res.status(201).json({
			success: true,
			message: 'Announcement created successfully',
			announcement,
		});
	} catch (error) {
		console.error('Create announcement error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to create announcement',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get all announcements
exports.getAnnouncements = async (req, res) => {
	try {
		const announcements = await Announcement.find().populate('createdBy', 'name').sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: announcements.length,
			announcements,
		});
	} catch (error) {
		console.error('Get announcements error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch announcements',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Update announcement status
exports.updateAnnouncementStatus = async (req, res) => {
	try {
		const { isActive } = req.body;

		const announcement = await Announcement.findByIdAndUpdate(
			req.params.id,
			{ isActive },
			{ new: true, runValidators: true }
		);

		if (!announcement) {
			return res.status(404).json({
				success: false,
				message: 'Announcement not found',
			});
		}

		res.status(200).json({
			success: true,
			message: `Announcement ${isActive ? 'activated' : 'deactivated'} successfully`,
			announcement,
		});
	} catch (error) {
		console.error('Update announcement error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update announcement',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Delete announcement
exports.deleteAnnouncement = async (req, res) => {
	try {
		const announcement = await Announcement.findByIdAndDelete(req.params.id);

		if (!announcement) {
			return res.status(404).json({
				success: false,
				message: 'Announcement not found',
			});
		}

		res.status(200).json({
			success: true,
			message: 'Announcement deleted successfully',
		});
	} catch (error) {
		console.error('Delete announcement error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to delete announcement',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get active users based on event attendance and XP
exports.getActiveUsers = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 5;

		// Find regular users (excluding admins and organizers)
		const regularUsers = await User.find({ role: 'user' }).select('_id');
		const regularUserIds = regularUsers.map((user) => user._id);

		// Find user activity with highest XP (only for regular users)
		const userActivities = await UserActivity.find({ user: { $in: regularUserIds } })
			.sort({ xp: -1 })
			.limit(limit)
			.populate('user', 'name email profilePicture');

		const activeUsers = userActivities.map((activity) => ({
			_id: activity.user._id,
			name: activity.user.name,
			email: activity.user.email,
			profilePicture: activity.user.profilePicture,
			xp: activity.xp,
			badge: activity.badge,
			streakCount: activity.streakCount,
			registeredEvents: activity.registeredEvents?.length || 0,
			attendedEvents: activity.registeredEvents?.filter((reg) => reg.attended).length || 0,
		}));

		res.status(200).json({
			success: true,
			users: activeUsers,
		});
	} catch (error) {
		console.error('Get active users error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch active users',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get flagged content (users, events, etc.)
exports.getFlaggedContent = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 5;

		// Get flagged users
		const flaggedUsers = await User.find({ isFlagged: true })
			.select('name email profilePicture role flagReason flaggedAt')
			.limit(limit);

		// Get flagged events
		const flaggedEvents = await Event.find({ isFlagged: true })
			.select('title shortDescription poster organizer flagReason flaggedAt')
			.sort({ createdAt: -1 })
			.populate('organizer', 'name email')
			.limit(limit);

		// Combine all flagged items and sort by flagged date
		const allFlaggedItems = [
			...flaggedUsers.map((user) => ({
				_id: user._id,
				type: 'user',
				name: user.name,
				email: user.email,
				profilePicture: user.profilePicture,
				role: user.role,
				reason: user.flagReason,
				flaggedAt: user.flaggedAt || new Date(),
			})),
			...flaggedEvents.map((event) => ({
				_id: event._id,
				type: 'event',
				title: event.title,
				description: event.shortDescription,
				poster: event.poster,
				organizer: {
					id: event.organizer._id,
					name: event.organizer.name,
					email: event.organizer.email,
				},
				reason: event.flagReason,
				flaggedAt: event.flaggedAt || new Date(),
			})),
		]
			.sort((a, b) => new Date(b.flaggedAt) - new Date(a.flaggedAt))
			.slice(0, limit);

		res.status(200).json({
			success: true,
			items: allFlaggedItems,
		});
	} catch (error) {
		console.error('Get flagged content error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch flagged content',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get admin profile data
exports.getAdminProfile = async (req, res) => {
	try {
		// Find the admin by ID (req.user._id contains the logged-in user's ID)
		const admin = await User.findById(req.user._id).select('-password');

		if (!admin) {
			return res.status(404).json({
				success: false,
				message: 'Admin profile not found',
			});
		}

		// Get additional stats that might be useful for admin profile
		const totalUsers = await User.countDocuments();
		const totalOrganizers = await User.countDocuments({ role: 'organizer' });
		const totalEvents = await Event.countDocuments();

		// Format the response in a simpler structure
		res.status(200).json({
			success: true,
			profile: {
				_id: admin._id,
				name: admin.name,
				email: admin.email,
				profilePicture: admin.profilePicture,
				bio: admin.bio || '',
				role: admin.role,
				status: admin.status || 'active',
				createdAt: admin.createdAt,
				stats: {
					totalUsers,
					totalOrganizers,
					totalEvents,
				},
			},
		});
	} catch (error) {
		console.error('Get admin profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch admin profile',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get admin activity logs
exports.getAdminLogs = async (req, res) => {
	try {
		const limit = parseInt(req.query.limit) || 10;
		const page = parseInt(req.query.page) || 1;
		const skip = (page - 1) * limit;

		// For now, we'll create mock logs as placeholder data
		// In a real implementation, you would retrieve this from a database
		const mockLogs = [
			{
				id: 1,
				action: 'update',
				targetType: 'User',
				description: 'Changed user role from user to organizer',
				timestamp: new Date(Date.now() - 3600000), // 1 hour ago
				ipAddress: '192.168.1.1',
				adminId: req.user._id,
				status: 'success',
			},
			{
				id: 2,
				action: 'update',
				targetType: 'Event',
				description: 'Flagged event for inappropriate content',
				timestamp: new Date(Date.now() - 7200000), // 2 hours ago
				ipAddress: '192.168.1.1',
				adminId: req.user._id,
				status: 'success',
			},
			{
				id: 3,
				action: 'create',
				targetType: 'Announcement',
				description: 'New platform-wide announcement',
				timestamp: new Date(Date.now() - 86400000), // 1 day ago
				ipAddress: '192.168.1.1',
				adminId: req.user._id,
				status: 'success',
			},
			{
				id: 4,
				action: 'update',
				targetType: 'User',
				description: 'Suspended user for violating community guidelines',
				timestamp: new Date(Date.now() - 172800000), // 2 days ago
				ipAddress: '192.168.1.1',
				adminId: req.user._id,
				status: 'success',
			},
			{
				id: 5,
				action: 'login',
				targetType: 'System',
				description: 'Admin login from new device',
				timestamp: new Date(Date.now() - 259200000), // 3 days ago
				ipAddress: '192.168.1.1',
				adminId: req.user._id,
				status: 'success',
			},
		];

		// Get the total count for pagination
		const totalCount = mockLogs.length;

		// Paginate the logs
		const paginatedLogs = mockLogs.slice(skip, skip + limit);

		res.status(200).json({
			success: true,
			logs: paginatedLogs,
			pagination: {
				total: totalCount,
				page,
				limit,
				pages: Math.ceil(totalCount / limit),
			},
		});
	} catch (error) {
		console.error('Get admin logs error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch admin logs',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Get admin team members
exports.getAdminTeam = async (req, res) => {
	try {
		// Fetch all admins from the database
		const adminTeam = await User.find({ role: 'admin' })
			.select('name email profilePicture bio createdAt lastLogin')
			.sort({ createdAt: 1 }); // Sort by creation date (oldest/senior admins first)

		// Enhance the data with additional fields
		const enrichedTeam = adminTeam.map((admin) => {
			const adminObj = admin.toObject();

			// Add additional information
			// In a real implementation, this might come from a separate AdminProfile model
			return {
				...adminObj,
				department: admin._id.equals(req.user._id) ? 'Lead Administrator' : 'Platform Management',
				joinDate: admin.createdAt,
				status: 'Active',
				permissions: admin._id.equals(req.user._id) ? 'Full Access' : 'Standard Admin',
				activityCount: Math.floor(Math.random() * 100) + 50, // Mock activity count between 50-150
				isCurrentUser: admin._id.equals(req.user._id),
			};
		});

		res.status(200).json({
			success: true,
			team: enrichedTeam,
		});
	} catch (error) {
		console.error('Get admin team error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch admin team information',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Handle admin profile picture upload
exports.uploadProfilePicture = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({
				success: false,
				message: 'No file uploaded',
			});
		}

		// Get current admin to check for existing profile picture
		const currentAdmin = await User.findById(req.user._id).select('profilePicture');
		if (!currentAdmin) {
			return res.status(404).json({
				success: false,
				message: 'Admin not found',
			});
		}

		// The picture URL should be in req.file.path thanks to multer-cloudinary
		const profilePicture = req.file.path;

		// Update user with new profile picture URL
		const admin = await User.findByIdAndUpdate(req.user._id, { profilePicture }, { new: true }).select('-password');

		if (!admin) {
			return res.status(404).json({
				success: false,
				message: 'Admin not found',
			});
		}

		// Delete old profile picture from Cloudinary if it exists and is different
		if (currentAdmin.profilePicture && currentAdmin.profilePicture !== profilePicture) {
			await replaceImage(currentAdmin.profilePicture, profilePicture);
		}

		res.status(200).json({
			success: true,
			message: 'Profile picture uploaded successfully',
			profilePicture: admin.profilePicture,
		});
	} catch (error) {
		console.error('Upload profile picture error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to upload profile picture',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
	try {
		const { name, email, bio } = req.body;

		// Create object with allowed fields
		const updateData = {};
		if (name) updateData.name = name;
		if (email) updateData.email = email;
		if (bio !== undefined) updateData.bio = bio;

		// Update user
		const admin = await User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true }).select(
			'-password'
		);

		if (!admin) {
			return res.status(404).json({
				success: false,
				message: 'Admin not found',
			});
		}

		// Format the profile data similar to getAdminProfile
		const profile = {
			_id: admin._id,
			name: admin.name,
			email: admin.email,
			profilePicture: admin.profilePicture || '',
			bio: admin.bio || '',
			role: admin.role,
			status: admin.status || 'active',
			createdAt: admin.createdAt,
		};

		res.status(200).json({
			success: true,
			message: 'Profile updated successfully',
			profile,
		});
	} catch (error) {
		console.error('Update admin profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update profile',
			error: process.env.NODE_ENV === 'development' ? error.message : null,
		});
	}
};

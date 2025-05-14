const User = require('../models/User');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const UserActivity = require('../models/UserActivity');
const Announcement = require('../models/Announcement');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

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
                totalRegistrations
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
            users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Get all organizers with event counts
exports.getAllOrganizers = async (req, res) => {
    try {
        const organizers = await User.find({ role: 'organizer' }).select('-password');
        
        // Get event counts for each organizer
        const organizerIds = organizers.map(org => org._id);
        const eventCounts = await Event.aggregate([
            { $match: { organizer: { $in: organizerIds } } },
            { $group: { _id: '$organizer', eventCount: { $sum: 1 } } }
        ]);
        
        // Create a map of organizer ID to event count
        const eventCountMap = {};
        eventCounts.forEach(item => {
            eventCountMap[item._id.toString()] = item.eventCount;
        });
        
        // Add event count to each organizer
        const organizersWithEventCount = organizers.map(organizer => {
            const orgObj = organizer.toObject();
            orgObj.eventCount = eventCountMap[organizer._id.toString()] || 0;
            return orgObj;
        });

        res.status(200).json({
            success: true,
            count: organizers.length,
            organizers: organizersWithEventCount
        });
    } catch (error) {
        console.error('Get all organizers error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch organizers',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
                errors: errors.array()
            });
        }

        const { role } = req.body;

        // Check if role is valid
        if (!['user', 'organizer', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Role must be user, organizer, or admin'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
                message: 'Invalid status. Status must be active or suspended'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`,
            user
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Flag or unflag a user
exports.toggleUserFlag = async (req, res) => {
    try {
        const { isFlagged, flagReason } = req.body;

        const updateData = { isFlagged };
        if (isFlagged && flagReason) {
            updateData.flagReason = flagReason;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${isFlagged ? 'flagged' : 'unflagged'} successfully`,
            user
        });
    } catch (error) {
        console.error('Toggle user flag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user flag status',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
                message: 'User not found'
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
                const eventIds = userEvents.map(event => event._id);
                
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
                message: deleteAllData 
                    ? 'User and all their data deleted successfully'
                    : 'User deleted successfully'
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
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Get all events with organizer info
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate('organizer', 'name email');

        res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error('Get all events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Event ${isFlagged ? 'flagged' : 'unflagged'} successfully`,
            event
        });
    } catch (error) {
        console.error('Toggle event flag error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event flag status',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Delete all registrations for this event
        await EventRegistration.deleteMany({ event: req.params.id });

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
            { $limit: 5 }
        ]);
        
        // Populate event details
        const eventIds = topEvents.map(item => item._id);
        const events = await Event.find({ _id: { $in: eventIds } }).select('title shortDescription');
        
        // Create a map of event ID to event details
        const eventMap = {};
        events.forEach(event => {
            eventMap[event._id.toString()] = {
                title: event.title,
                shortDescription: event.shortDescription
            };
        });
        
        // Add event details to top events
        const topEventDetails = topEvents.map(item => ({
            _id: item._id,
            count: item.count,
            ...eventMap[item._id.toString()]
        }));
        
        // Top organizers based on total registrations for their events
        const topOrganizers = await Event.aggregate([
            { $lookup: { from: 'eventregistrations', localField: '_id', foreignField: 'event', as: 'registrations' } },
            { $addFields: { registrationCount: { $size: '$registrations' } } },
            { $group: { _id: '$organizer', totalRegistrations: { $sum: '$registrationCount' }, eventCount: { $sum: 1 } } },
            { $sort: { totalRegistrations: -1 } },
            { $limit: 5 }
        ]);
        
        // Populate organizer details
        const organizerIds = topOrganizers.map(item => mongoose.Types.ObjectId(item._id));
        const organizers = await User.find({ _id: { $in: organizerIds } }).select('name email');
        
        // Create a map of organizer ID to organizer details
        const organizerMap = {};
        organizers.forEach(org => {
            organizerMap[org._id.toString()] = {
                name: org.name,
                email: org.email
            };
        });
        
        // Add organizer details to top organizers
        const topOrganizerDetails = topOrganizers.map(item => ({
            _id: item._id,
            totalRegistrations: item.totalRegistrations,
            eventCount: item.eventCount,
            ...organizerMap[item._id.toString()]
        }));
        
        // Top users based on XP
        const topUsers = await UserActivity.find()
            .sort({ xp: -1 })
            .limit(10)
            .populate('user', 'name email')
            .select('xp badges streak');

        res.status(200).json({
            success: true,
            analytics: {
                topEvents: topEventDetails,
                topOrganizers: topOrganizerDetails,
                topUsers
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Get flagged items (users or events)
exports.getFlaggedItems = async (req, res) => {
    try {
        const flaggedUsers = await User.find({ isFlagged: true }).select('-password');
        const flaggedEvents = await Event.find({ isFlagged: true }).populate('organizer', 'name email');

        res.status(200).json({
            success: true,
            flaggedItems: {
                users: flaggedUsers,
                events: flaggedEvents
            }
        });
    } catch (error) {
        console.error('Get flagged items error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch flagged items',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Create announcement
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, type, expiresAt } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            type: type || 'info',
            expiresAt,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            announcement
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create announcement',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Get all announcements
exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: announcements.length,
            announcements
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch announcements',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Announcement ${isActive ? 'activated' : 'deactivated'} successfully`,
            announcement
        });
    } catch (error) {
        console.error('Update announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update announcement',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
                message: 'Announcement not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        console.error('Delete announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete announcement',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
}; 
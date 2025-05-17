const User = require('../models/User');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const { cloudinary } = require('../config/cloudinary');

// Get organizer profile
exports.getProfile = async (req, res) => {
    try {
        // Get organizer info without password
        const user = await User.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Format the profile data
        const profile = {
            _id: user._id,
            name: user.name,
            email: user.email,
            organizationName: user.organizationName || '',
            bio: user.bio || '',
            profilePicture: user.profilePicture || '',
            socialLinks: user.socialLinks || {
                website: '',
                linkedin: '',
                twitter: '',
                instagram: ''
            }
        };

        res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Get organizer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile data',
            error: process.env.NODE_ENV === 'development' ? error.message : null
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
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Format the profile data
        const profile = {
            _id: user._id,
            name: user.name,
            email: user.email,
            organizationName: user.organizationName || '',
            bio: user.bio || '',
            profilePicture: user.profilePicture || '',
            socialLinks: user.socialLinks || {
                website: '',
                linkedin: '',
                twitter: '',
                instagram: ''
            }
        };

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Update organizer profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // The picture URL should be in req.file.path thanks to multer-cloudinary
        const profilePicture = req.file.path;

        // Update user with new profile picture URL
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { profilePicture },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile picture updated successfully',
            profilePicture: user.profilePicture
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile picture',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Get organizer dashboard data
exports.getDashboard = async (req, res) => {
    try {
        // Get organizer info without password
        const user = await User.findById(req.user._id).select('-password');

        // Get count of events organized by this user
        const eventCount = await Event.countDocuments({ organizer: req.user._id });
        
        // Get total attendees across all events
        const events = await Event.find({ organizer: req.user._id }).select('_id');
        const eventIds = events.map(event => event._id);
        
        const attendeeCount = await EventRegistration.countDocuments({
            event: { $in: eventIds },
            status: { $in: ['registered', 'attended'] }
        });

        // Calculate total revenue (if applicable)
        const revenue = await Event.aggregate([
            { $match: { organizer: req.user._id } },
            { $group: { _id: null, total: { $sum: '$price' } } }
        ]);
        
        const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture
                },
                stats: {
                    eventCount,
                    attendeeCount,
                    revenue: totalRevenue
                }
            }
        });
    } catch (error) {
        console.error('Get organizer dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Get events created by the organizer
exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error('Get organizer events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const eventData = {
            ...req.body,
            organizer: req.user._id
        };
        
        // If there's a poster file, the URL should already be in req.file.path from multer-cloudinary
        if (req.file) {
            eventData.poster = req.file.path;
        }

        const event = await Event.create(eventData);

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Get a single event with detailed info
exports.getEventDetails = async (req, res) => {
    try {
        const event = await Event.findOne({
            _id: req.params.id,
            organizer: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or you do not have permission'
            });
        }

        // Get registrations for this event
        const registrations = await EventRegistration.find({ event: event._id })
            .populate('user', 'name email profilePicture')
            .sort({ registrationDate: -1 });

        // Get daily registration count for chart
        const dailyRegistrations = await EventRegistration.aggregate([
            { $match: { event: event._id } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$registrationDate" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            event,
            registrations,
            analytics: {
                totalRegistrations: registrations.length,
                dailyRegistrations: dailyRegistrations.map(item => ({
                    date: item._id,
                    count: item.count
                }))
            }
        });
    } catch (error) {
        console.error('Get event details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event details',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    try {
        // Check if the event exists and belongs to this organizer
        const event = await Event.findOne({
            _id: req.params.id,
            organizer: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or you do not have permission'
            });
        }

        // Update event data
        const updateData = { ...req.body };
        
        // If there's a new poster file
        if (req.file) {
            updateData.poster = req.file.path;
            
            // Delete old poster image from Cloudinary if it exists
            if (event.poster && event.poster.includes('cloudinary')) {
                const publicId = event.poster.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        // Check if the event exists and belongs to this organizer
        const event = await Event.findOne({
            _id: req.params.id,
            organizer: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or you do not have permission'
            });
        }

        // Delete event registrations
        await EventRegistration.deleteMany({ event: req.params.id });

        // Delete event
        await Event.findByIdAndDelete(req.params.id);

        // Delete poster image from Cloudinary if it exists
        if (event.poster && event.poster.includes('cloudinary')) {
            const publicId = event.poster.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

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

// Get attendees list for a specific event
exports.getEventAttendees = async (req, res) => {
    try {
        // Check if the event exists and belongs to this organizer
        const event = await Event.findOne({
            _id: req.params.id,
            organizer: req.user._id
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found or you do not have permission'
            });
        }

        // Get registrations with user details
        const attendees = await EventRegistration.find({ 
                event: req.params.id,
                status: { $in: ['registered', 'attended'] }
            })
            .populate('user', 'name email profilePicture')
            .sort({ registrationDate: -1 });

        res.status(200).json({
            success: true,
            count: attendees.length,
            attendees: attendees.map(reg => ({
                id: reg._id,
                userId: reg.user._id,
                name: reg.user.name,
                email: reg.user.email,
                profilePicture: reg.user.profilePicture,
                registrationDate: reg.registrationDate,
                status: reg.status,
                hasFeedback: reg.feedback.submitted
            }))
        });
    } catch (error) {
        console.error('Get event attendees error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch attendees',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Get feedback summary for organizer's events
exports.getFeedbackSummary = async (req, res) => {
    try {
        // Get all events by this organizer
        const events = await Event.find({ organizer: req.user._id }).select('_id title');
        
        // Get feedback for these events
        const feedback = await EventRegistration.aggregate([
            {
                $match: {
                    event: { $in: events.map(event => event._id) },
                    feedback: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$event',
                    averageRating: { $avg: '$feedback.rating' },
                    totalFeedback: { $sum: 1 },
                    feedback: {
                        $push: {
                            rating: '$feedback.rating',
                            comment: '$feedback.comment',
                            date: '$feedback.date'
                        }
                    }
                }
            }
        ]);

        // Format the response
        const summary = events.map(event => {
            const eventFeedback = feedback.find(f => f._id.toString() === event._id.toString());
            return {
                eventId: event._id,
                eventTitle: event.title,
                averageRating: eventFeedback ? eventFeedback.averageRating : 0,
                totalFeedback: eventFeedback ? eventFeedback.totalFeedback : 0,
                feedback: eventFeedback ? eventFeedback.feedback : []
            };
        });

        // Calculate overall statistics
        const overallStats = {
            totalEvents: events.length,
            totalFeedback: feedback.reduce((sum, f) => sum + f.totalFeedback, 0),
            averageRating: feedback.length > 0 
                ? feedback.reduce((sum, f) => sum + f.averageRating, 0) / feedback.length 
                : 0
        };

        res.status(200).json({
            success: true,
            data: {
                summary,
                overallStats
            }
        });
    } catch (error) {
        console.error('Get feedback summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch feedback summary',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
}; 
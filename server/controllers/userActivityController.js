const UserActivity = require('../models/UserActivity');
const Event = require('../models/Event');

// Get user's profile with XP and badge
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find or create user activity
        let userActivity = await UserActivity.findOne({ user: userId });
        
        if (!userActivity) {
            userActivity = await UserActivity.create({ user: userId });
        }
        
        res.status(200).json({
            success: true,
            profile: {
                xp: userActivity.xp,
                badge: userActivity.badge,
                streakCount: userActivity.streakCount
            }
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user's saved events
exports.getSavedEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const userActivity = await UserActivity.findOne({ user: userId })
            .populate({
                path: 'savedEvents.event',
                populate: {
                    path: 'organizer',
                    select: 'name'
                }
            });
        
        if (!userActivity) {
            return res.status(200).json({
                success: true,
                savedEvents: []
            });
        }
        
        // Extract and format saved events
        const savedEvents = userActivity.savedEvents
            .filter(item => item.event) // Filter out any null references
            .map(item => ({
                ...item.event.toObject(),
                savedAt: item.savedAt
            }));
        
        res.status(200).json({
            success: true,
            count: savedEvents.length,
            savedEvents
        });
    } catch (error) {
        console.error('Error getting saved events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user's registered events
exports.getRegisteredEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const userActivity = await UserActivity.findOne({ user: userId })
            .populate({
                path: 'registeredEvents.event',
                populate: {
                    path: 'organizer',
                    select: 'name'
                }
            });
        
        if (!userActivity) {
            return res.status(200).json({
                success: true,
                registeredEvents: []
            });
        }
        
        // Extract and format registered events
        const registeredEvents = userActivity.registeredEvents
            .filter(item => item.event) // Filter out any null references
            .map(item => ({
                ...item.event.toObject(),
                registeredAt: item.registeredAt,
                attended: item.attended,
                feedback: {
                    given: item.feedback.given,
                    rating: item.feedback.rating,
                    comment: item.feedback.comment
                }
            }));
        
        res.status(200).json({
            success: true,
            count: registeredEvents.length,
            registeredEvents
        });
    } catch (error) {
        console.error('Error getting registered events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get leaderboard (top users by XP)
exports.getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const leaderboard = await UserActivity.find()
            .sort({ xp: -1 }) // Sort by XP descending
            .limit(limit)
            .populate('user', 'name profilePicture')
            .select('user xp badge streakCount -_id');
        
        res.status(200).json({
            success: true,
            count: leaderboard.length,
            leaderboard
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get XP history for the current user
exports.getUserEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const userActivity = await UserActivity.findOne({ user: userId });
        
        if (!userActivity) {
            return res.status(200).json({
                success: true,
                xp: 0,
                badge: 'Newbie',
                savedEvents: [],
                registeredEvents: []
            });
        }
        
        // Get user's saved events
        await userActivity.populate({
            path: 'savedEvents.event',
            select: 'title shortDescription poster date location type'
        });
        
        // Get user's registered events
        await userActivity.populate({
            path: 'registeredEvents.event',
            select: 'title shortDescription poster date location type'
        });
        
        // Format saved events
        const savedEvents = userActivity.savedEvents
            .filter(item => item.event)
            .map(item => ({
                id: item.event._id,
                title: item.event.title,
                shortDescription: item.event.shortDescription,
                poster: item.event.poster,
                date: item.event.date,
                location: item.event.location,
                type: item.event.type,
                savedAt: item.savedAt
            }));
        
        // Format registered events
        const registeredEvents = userActivity.registeredEvents
            .filter(item => item.event)
            .map(item => ({
                id: item.event._id,
                title: item.event.title,
                shortDescription: item.event.shortDescription,
                poster: item.event.poster,
                date: item.event.date,
                location: item.event.location,
                type: item.event.type,
                registeredAt: item.registeredAt,
                attended: item.attended,
                feedback: item.feedback
            }));
        
        res.status(200).json({
            success: true,
            xp: userActivity.xp,
            badge: userActivity.badge,
            savedEvents,
            registeredEvents,
            streakCount: userActivity.streakCount,
        });
    } catch (error) {
        console.error('Error getting user events:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 
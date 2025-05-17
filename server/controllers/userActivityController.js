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
        
        // Ensure badge is correctly set based on current XP
        let currentBadge = 'Newbie';
        if (userActivity.xp >= 500) {
            currentBadge = 'Master';
        } else if (userActivity.xp >= 300) {
            currentBadge = 'Veteran';
        } else if (userActivity.xp >= 150) {
            currentBadge = 'Champ';
        } else if (userActivity.xp >= 50) {
            currentBadge = 'Regular';
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
        
        // Get leaderboard data with user info
        const leaderboard = await UserActivity.find()
            .sort({ xp: -1 }) // Sort by XP descending
            .limit(limit)
            .populate('user', 'name profilePicture')
            .select('user xp badge streakCount -_id');
            
        // Format response data
        const formattedLeaderboard = leaderboard
            .filter(item => item.user) // Filter out entries with missing user data
            .map(item => ({
                _id: item.user._id,
                name: item.user.name,
                profilePicture: item.user.profilePicture,
                xp: item.xp,
                badge: item.badge,
                streakCount: item.streakCount
            }));
        
        res.status(200).json({
            success: true,
            count: formattedLeaderboard.length,
            leaderboard: formattedLeaderboard
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
                events: []
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
                _id: item.event._id,
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
                _id: item.event._id,
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
            events: registeredEvents,
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

// Get XP history for the current user
exports.getXPHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const userActivity = await UserActivity.findOne({ user: userId })
            .populate({
                path: 'registeredEvents.event',
                select: 'title date'
            });
        
        if (!userActivity) {
            return res.status(200).json({
                success: true,
                xpHistory: []
            });
        }
        
        // Generate XP history entries from registered events
        const eventXPHistory = userActivity.registeredEvents
            .filter(item => item.event && item.attended)
            .map(item => ({
                _id: item._id,
                date: item.registeredAt,
                description: `Attended event: ${item.event.title || 'Event'}`,
                amount: 10 // Standard XP for attending events
            }));
            
        // Add streak bonus entries if available
        const streakXPHistory = [];
        if (userActivity.streakCount > 0) {
            // Calculate how many streak bonuses the user has received (every 3 streaks)
            const bonusCount = Math.floor(userActivity.streakCount / 3);
            
            // Add an entry for each streak bonus
            for (let i = 1; i <= bonusCount; i++) {
                streakXPHistory.push({
                    _id: `streak-${i}`,
                    date: userActivity.lastEventDate || new Date(),
                    description: `Weekend streak bonus (${i * 3} weeks)`,
                    amount: 15 // Bonus XP for streaks
                });
            }
        }
        
        // Add feedback XP entries
        const feedbackXPHistory = userActivity.registeredEvents
            .filter(item => item.feedback && item.feedback.given)
            .map(item => ({
                _id: `feedback-${item._id}`,
                date: item.feedback.givenAt || item.registeredAt,
                description: `Provided feedback for an event`,
                amount: 5 // XP for giving feedback
            }));
        
        // Combine all XP history entries and sort by date (newest first)
        const xpHistory = [...eventXPHistory, ...streakXPHistory, ...feedbackXPHistory]
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        res.status(200).json({
            success: true,
            xpHistory
        });
    } catch (error) {
        console.error('Error getting XP history:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
                badges: []
            });
        }
        
        // Get the user's current badge level
        const currentBadge = userActivity.badge;
        const currentXP = userActivity.xp;
        
        // Define all available badges
        const allBadges = [
            {
                _id: 'newbie',
                name: 'Newbie',
                description: 'Welcome to the community!',
                xpRequired: 0,
                unlocked: true
            },
            {
                _id: 'regular',
                name: 'Regular',
                description: 'Attended multiple events',
                xpRequired: 50,
                unlocked: currentXP >= 50
            },
            {
                _id: 'champ',
                name: 'Champ',
                description: 'Active community member',
                xpRequired: 150,
                unlocked: currentXP >= 150
            },
            {
                _id: 'veteran',
                name: 'Veteran',
                description: 'Dedicated long-term member',
                xpRequired: 300,
                unlocked: currentXP >= 300
            },
            {
                _id: 'master',
                name: 'Master',
                description: 'Elite community contributor',
                xpRequired: 500,
                unlocked: currentXP >= 500
            }
        ];
        
        res.status(200).json({
            success: true,
            badges: allBadges,
            currentBadge
        });
    } catch (error) {
        console.error('Error getting user badges:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}; 
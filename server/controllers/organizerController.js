const User = require('../models/User');

// Get organizer dashboard data
exports.getDashboard = async (req, res) => {
    try {
        // Get organizer info without password
        const user = await User.findById(req.user._id).select('-password');

        // For now, we're just returning the user data
        // Later we'll add created events, analytics, etc.

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture
                }
                // Will add more data here like created events, analytics
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
        // In a future implementation, this will fetch events from an Event model
        // where the organizer ID matches the current user's ID

        res.status(200).json({
            success: true,
            message: 'Event fetching functionality coming soon',
            events: []
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
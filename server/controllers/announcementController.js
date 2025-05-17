const Announcement = require('../models/Announcement');

// Get active announcements for users
exports.getActiveAnnouncements = async (req, res) => {
    try {
        // Get all active announcements that haven't expired
        const announcements = await Announcement.find({
            isActive: true,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name');

        res.status(200).json({
            success: true,
            count: announcements.length,
            announcements
        });
    } catch (error) {
        console.error('Get active announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch announcements',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
}; 

// Get user notifications (formatted announcements)
exports.getUserNotifications = async (req, res) => {
    try {
        // Get all active announcements that haven't expired
        const announcements = await Announcement.find({
            isActive: true,
            $or: [
                { expiresAt: { $exists: false } },
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        })
        .sort({ createdAt: -1 })
        .populate('createdBy', 'name');

        // Format announcements as notifications for the client
        const notifications = announcements.map(announcement => ({
            _id: announcement._id,
            title: announcement.title,
            message: announcement.message,
            type: announcement.type || 'info',
            link: announcement.link || null,
            createdAt: announcement.createdAt
        }));

        res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error('Get user notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
}; 
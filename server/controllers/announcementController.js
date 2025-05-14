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
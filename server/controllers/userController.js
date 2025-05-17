const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary credentials are available
const hasCloudinaryCredentials = 
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET;

// Configure storage based on availability of Cloudinary credentials
let storage;
let upload;

if (hasCloudinaryCredentials) {
    // Configure Cloudinary
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    // Configure Cloudinary storage for Multer
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'profile_pictures',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
        }
    });

    // Configure Multer with Cloudinary storage
    upload = multer({
        storage: storage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
        fileFilter: (req, file, cb) => {
            const filetypes = /jpeg|jpg|png|gif/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            
            if (mimetype && extname) {
                return cb(null, true);
            }
            
            cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'));
        }
    }).single('profilePicture');
} else {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads/profile_pictures');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Configure local disk storage for development
    const diskStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            cb(null, 'profile-' + uniqueSuffix + ext);
        }
    });

    // Configure Multer with local storage
    upload = multer({
        storage: diskStorage,
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
        fileFilter: (req, file, cb) => {
            const filetypes = /jpeg|jpg|png|gif/;
            const mimetype = filetypes.test(file.mimetype);
            const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
            
            if (mimetype && extname) {
                return cb(null, true);
            }
            
            cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'));
        }
    }).single('profilePicture');

    // Log a warning about missing Cloudinary credentials
    console.warn('Cloudinary credentials not found. Using local storage for profile pictures.');
    console.warn('For production, please configure Cloudinary. See README-CLOUDINARY.md.');
}

// Get user dashboard data
exports.getDashboard = async (req, res) => {
    try {
        // Get user info without password
        const user = await User.findById(req.user._id).select('-password');

        // Get user activity data
        const userActivity = await UserActivity.findOne({ user: req.user._id });
        
        // Create profile object
        const profile = {
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            role: user.role,
            college: user.college,
            xp: userActivity ? userActivity.xp : 0,
            badge: userActivity ? userActivity.badge : 'Newbie',
            streakCount: userActivity ? userActivity.streakCount : 0
        };

        res.status(200).json({
            success: true,
            profile: profile,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profilePicture: user.profilePicture
                }
            }
        });
    } catch (error) {
        console.error('Get user dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, college } = req.body;

        // Create object with allowed fields
        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (college) updateData.college = college;

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                college: user.college
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
};

// Upload profile picture
exports.uploadProfilePicture = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            console.error('Profile picture upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading profile picture'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        
        try {
            let profilePicturePath;
            
            if (hasCloudinaryCredentials) {
                // When using Cloudinary, the path is already in the file object
                profilePicturePath = req.file.path;
            } else {
                // For local storage, construct a URL path
                const baseUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 4000}`;
                const relativePath = '/uploads/profile_pictures/' + req.file.filename;
                profilePicturePath = baseUrl + relativePath;
            }
            
            // Update user with new profile picture URL
            const user = await User.findByIdAndUpdate(
                req.user._id,
                { profilePicture: profilePicturePath },
                { new: true }
            ).select('-password');
            
            res.status(200).json({
                success: true,
                message: 'Profile picture updated successfully',
                profilePicture: user.profilePicture
            });
        } catch (error) {
            console.error('Error saving profile picture to user:', error);
            res.status(500).json({
                success: false,
                message: 'Error saving profile picture',
                error: process.env.NODE_ENV === 'development' ? error.message : null
            });
        }
    });
}; 
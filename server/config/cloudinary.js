const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
	api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key',
	api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret',
});

// Set up storage engine with optimized settings
const storage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'youngminds-events',
		allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'],
		transformation: [
			{
				width: 800,
				crop: 'limit',
				quality: 'auto:good',
				fetch_format: 'auto',
			},
		],
	},
});

// Specialized storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'youngminds-profiles',
		allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
		transformation: [
			{
				width: 500,
				height: 500,
				crop: 'fill',
				gravity: 'face',
				quality: 'auto:good',
				fetch_format: 'auto',
			},
		],
	},
});

// Specialized storage for organizer brand logos
const organizerLogoStorage = new CloudinaryStorage({
	cloudinary: cloudinary,
	params: {
		folder: 'youngminds-logos',
		allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
		transformation: [
			{
				width: 400,
				height: 400,
				crop: 'fit',
				background: 'transparent',
				quality: 'auto:good',
				fetch_format: 'auto',
			},
		],
	},
});

// File size limits (in MB for easy reading, converted to bytes for multer)
const FILE_SIZE_LIMITS = {
	general: 5, // 5MB for events/internships posters
	profilePicture: 3, // 3MB for profile pictures
	organizerLogo: 2, // 2MB for organizer logos
};

// Helper function to convert MB to bytes
const mbToBytes = (mb) => mb * 1024 * 1024;

// Create multer upload middleware
const upload = multer({
	storage: storage,
	limits: {
		fileSize: mbToBytes(FILE_SIZE_LIMITS.general),
	},
});

// Create specialized upload middlewares
const uploadProfilePicture = multer({
	storage: profilePictureStorage,
	limits: {
		fileSize: mbToBytes(FILE_SIZE_LIMITS.profilePicture),
	},
});

const uploadOrganizerLogo = multer({
	storage: organizerLogoStorage,
	limits: {
		fileSize: mbToBytes(FILE_SIZE_LIMITS.organizerLogo),
	},
});

module.exports = {
	cloudinary,
	upload,
	uploadProfilePicture,
	uploadOrganizerLogo,
	FILE_SIZE_LIMITS, // Export the limits for use in error messages
};

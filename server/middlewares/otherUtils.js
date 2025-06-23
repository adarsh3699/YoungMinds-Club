const { FILE_SIZE_LIMITS } = require('../config/cloudinary');

/**
 * Centralized middleware to handle multer errors
 * Provides user-friendly error messages for file upload failures
 */
const handleMulterError = (error, req, res, next) => {
	if (error) {
		console.error('Multer error:', error);

		if (error.code === 'LIMIT_FILE_SIZE') {
			// Determine file size limit and type based on the route
			let sizeLimit = `${FILE_SIZE_LIMITS.general}MB`;
			let fileType = 'image';

			// Check route path to determine appropriate file type and size limit
			if (req.route && req.route.path.includes('picture')) {
				if (req.originalUrl.includes('/organizer/')) {
					sizeLimit = `${FILE_SIZE_LIMITS.organizerLogo}MB`;
					fileType = 'logo';
				} else {
					sizeLimit = `${FILE_SIZE_LIMITS.profilePicture}MB`;
					fileType = 'profile picture';
				}
			}

			return res.status(400).json({
				success: false,
				message: `${
					fileType.charAt(0).toUpperCase() + fileType.slice(1)
				} file too large. Maximum size allowed is ${sizeLimit}`,
				error: 'Internal Server Error',
			});
		} else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
			return res.status(400).json({
				success: false,
				message: 'Invalid file field',
				error: 'Internal Server Error',
			});
		} else if (error.message && error.message.includes('Only image files')) {
			// Determine file type for error message
			let fileType = 'image';
			if (req.route && req.route.path.includes('picture')) {
				if (req.originalUrl.includes('/organizer/')) {
					fileType = 'logo';
				} else {
					fileType = 'profile picture';
				}
			}

			return res.status(400).json({
				success: false,
				message: `Invalid ${fileType} format. Please upload only image files (JPG, PNG, GIF, WebP, SVG)`,
				error: 'Internal Server Error',
			});
		} else {
			return res.status(400).json({
				success: false,
				message: 'File upload failed. Please try again',
				error: 'Internal Server Error',
			});
		}
	}
	next();
};

module.exports = { handleMulterError };

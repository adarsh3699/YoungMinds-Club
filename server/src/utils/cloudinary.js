const { cloudinary } = require('../config/cloudinary');

/**
 * Extract public ID from Cloudinary URL
 * @param {string} cloudinaryUrl - The Cloudinary URL
 * @returns {string|null} - The public ID or null if not a Cloudinary URL
 */
const extractPublicId = (cloudinaryUrl) => {
	if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary')) {
		return null;
	}

	try {
		// Handle different Cloudinary URL formats
		// Example: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
		const urlParts = cloudinaryUrl.split('/');
		const uploadIndex = urlParts.findIndex((part) => part === 'upload');

		if (uploadIndex === -1) {
			return null;
		}

		// Get everything after 'upload/' (skip version if present)
		let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');

		// Remove version prefix if present (e.g., v1234567890/)
		if (pathAfterUpload.startsWith('v') && pathAfterUpload.includes('/')) {
			const parts = pathAfterUpload.split('/');
			if (parts[0].match(/^v\d+$/)) {
				pathAfterUpload = parts.slice(1).join('/');
			}
		}

		// Remove file extension
		const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

		return publicId;
	} catch (error) {
		console.error('Error extracting public ID from Cloudinary URL:', error);
		return null;
	}
};

/**
 * Delete image from Cloudinary
 * @param {string} cloudinaryUrl - The Cloudinary URL
 * @returns {Promise<boolean>} - Whether the deletion was successful
 */
const deleteImage = async (cloudinaryUrl) => {
	const publicId = extractPublicId(cloudinaryUrl);

	if (!publicId) {
		console.warn('Could not extract public ID from URL:', cloudinaryUrl);
		return false;
	}

	try {
		console.log('Deleting image from Cloudinary, public ID:', publicId);
		const result = await cloudinary.uploader.destroy(publicId);

		if (result.result === 'ok') {
			console.log('Successfully deleted image from Cloudinary:', publicId);
			return true;
		} else {
			console.warn('Cloudinary deletion result:', result);
			return false;
		}
	} catch (error) {
		console.error('Error deleting image from Cloudinary:', error);
		return false;
	}
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} cloudinaryUrls - Array of Cloudinary URLs
 * @returns {Promise<boolean[]>} - Array of deletion results
 */
const deleteMultipleImages = async (cloudinaryUrls) => {
	const validUrls = cloudinaryUrls.filter((url) => url && url.includes('cloudinary'));

	if (validUrls.length === 0) {
		return [];
	}

	try {
		const deletePromises = validUrls.map((url) => deleteImage(url));
		return await Promise.all(deletePromises);
	} catch (error) {
		console.error('Error deleting multiple images from Cloudinary:', error);
		return validUrls.map(() => false);
	}
};

/**
 * Replace image in Cloudinary (delete old, keep new)
 * @param {string} oldImageUrl - The old Cloudinary URL to delete
 * @param {string} newImageUrl - The new Cloudinary URL to keep
 * @returns {Promise<boolean>} - Whether the replacement was successful
 */
const replaceImage = async (oldImageUrl, newImageUrl) => {
	// Only delete if the URLs are different and old URL exists
	if (!oldImageUrl || !newImageUrl || oldImageUrl === newImageUrl) {
		return true;
	}

	return await deleteImage(oldImageUrl);
};

module.exports = {
	extractPublicId,
	deleteImage,
	deleteMultipleImages,
	replaceImage,
};

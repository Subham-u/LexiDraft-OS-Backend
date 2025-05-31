import { v2 as cloudinary } from 'cloudinary';
import config from '~/config/config';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';

// Configure Cloudinary
cloudinary.config({
	cloud_name: config.cloudinary.cloudName,
	api_key: config.cloudinary.apiKey,
	api_secret: config.cloudinary.apiSecret
});

/**
 * Upload a file to Cloudinary
 * @param {Buffer|Stream} file - File to upload
 * @param {string} folder - Folder path in Cloudinary
 * @param {Object} options - Additional upload options
 * @returns {Promise<string>} URL of the uploaded file
 */
export const uploadToCloudinary = async (file, folder, options = {}) => {
	try {
		const result = await cloudinary.uploader.upload(file, {
			folder,
			resource_type: 'auto',
			...options
		});

		return result.secure_url;
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error uploading file to Cloudinary: ' + error.message);
	}
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file in Cloudinary
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
	try {
		await cloudinary.uploader.destroy(publicId);
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error deleting file from Cloudinary: ' + error.message);
	}
};

/**
 * Generate a signed URL for temporary access to a file
 * @param {string} publicId - Public ID of the file in Cloudinary
 * @param {number} expiresIn - URL expiration time in seconds
 * @returns {Promise<string>} Signed URL
 */
export const getSignedUrl = async (publicId, expiresIn = 3600) => {
	try {
		const timestamp = Math.round(Date.now() / 1000) + expiresIn;
		const signature = cloudinary.utils.api_sign_request(
			{
				public_id: publicId,
				timestamp
			},
			config.cloudinary.apiSecret
		);

		return cloudinary.url(publicId, {
			sign_url: true,
			api_key: config.cloudinary.apiKey,
			timestamp,
			signature
		});
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error generating signed URL: ' + error.message);
	}
};

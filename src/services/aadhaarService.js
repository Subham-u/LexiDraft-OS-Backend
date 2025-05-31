import axios from 'axios';
import config from '~/config/config';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';

/**
 * Initiate Aadhaar eSign process
 * @param {Object} params - Parameters for eSign initiation
 * @param {string} params.documentUrl - URL of the document to be signed
 * @param {string} params.userId - ID of the user initiating the signing
 * @returns {Promise<Object>} Transaction details
 */
export const initiateAadhaarSigning = async ({ documentUrl, userId }) => {
	try {
		// In a real implementation, this would call the Aadhaar eSign API
		// For now, we'll simulate the API call
		const response = await axios.post(
			'https://esign.aadhaar.gov.in/initiate',
			{
				documentUrl,
				userId
				// Add other required parameters based on Aadhaar eSign API documentation
			},
			{
				headers: {
					Authorization: `Bearer ${config.aadhaar.apiKey}`,
					'Content-Type': 'application/json'
				}
			}
		);

		return {
			transactionId: response.data.transactionId
			// Add other response data as needed
		};
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error initiating Aadhaar signing: ' + error.message);
	}
};

/**
 * Verify Aadhaar OTP and complete signing
 * @param {Object} params - Parameters for OTP verification
 * @param {string} params.transactionId - Transaction ID from initiation
 * @param {string} params.otp - OTP received by the user
 * @returns {Promise<Object>} Signed document details
 */
export const verifyAadhaarOTP = async ({ transactionId, otp }) => {
	try {
		// In a real implementation, this would call the Aadhaar eSign API
		// For now, we'll simulate the API call
		const response = await axios.post(
			'https://esign.aadhaar.gov.in/verify',
			{
				transactionId,
				otp
			},
			{
				headers: {
					Authorization: `Bearer ${config.aadhaar.apiKey}`,
					'Content-Type': 'application/json'
				}
			}
		);

		return {
			signedDocument: response.data.signedDocumentUrl,
			signatureImage: response.data.signatureImageUrl
			// Add other response data as needed
		};
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error verifying Aadhaar OTP: ' + error.message);
	}
};

/**
 * Get Aadhaar eSign status
 * @param {string} transactionId - Transaction ID to check
 * @returns {Promise<Object>} Status details
 */
export const getAadhaarSignStatus = async (transactionId) => {
	try {
		// In a real implementation, this would call the Aadhaar eSign API
		// For now, we'll simulate the API call
		const response = await axios.get(`https://esign.aadhaar.gov.in/status/${transactionId}`, {
			headers: {
				Authorization: `Bearer ${config.aadhaar.apiKey}`
			}
		});

		return {
			status: response.data.status,
			timestamp: response.data.timestamp
			// Add other response data as needed
		};
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting Aadhaar sign status: ' + error.message);
	}
};

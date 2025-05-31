import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';
import { ZoomMtg } from '@zoom/meetingsdk';
import { v4 as uuidv4 } from 'uuid';

class ZoomService {
	constructor() {
		this.apiKey = process.env.ZOOM_API_KEY;
		this.apiSecret = process.env.ZOOM_API_SECRET;
		this.jwtToken = this.generateJWT();
	}

	generateJWT() {
		const payload = {
			iss: this.apiKey,
			exp: Date.now() + 5000
		};
		return ZoomMtg.generateSDKSignature(payload, this.apiSecret);
	}

	async createMeeting(consultation) {
		try {
			const meetingNumber = uuidv4();
			const meetingPassword = Math.random().toString(36).slice(-8);

			// Create meeting link
			const meetingLink = `https://zoom.us/j/${meetingNumber}?pwd=${meetingPassword}`;

			return {
				meetingId: meetingNumber,
				meetingLink,
				password: meetingPassword,
				type: consultation.type,
				scheduledAt: consultation.scheduledAt,
				duration: consultation.duration
			};
		} catch (error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating Zoom meeting: ' + error.message);
		}
	}

	async joinMeeting(meetingId, userId, userName) {
		try {
			// Generate a signature for the user to join
			const signature = ZoomMtg.generateSDKSignature({
				meetingNumber: meetingId,
				role: 0, // 0 for attendee, 1 for host
				sdkKey: this.apiKey,
				sdkSecret: this.apiSecret,
				userIdentity: userId,
				userName: userName
			});

			return {
				meetingId,
				signature,
				sdkKey: this.apiKey,
				userName,
				userEmail: `${userId}@lexidraft.com`,
				passWord: '', // This should be retrieved from your database
				role: 0
			};
		} catch (error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error joining Zoom meeting: ' + error.message);
		}
	}

	async endMeeting(meetingId) {
		try {
			// In a real implementation, you would call Zoom's API to end the meeting
			// For now, we'll just return a success response
			return {
				meetingId,
				endedAt: new Date()
			};
		} catch (error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error ending Zoom meeting: ' + error.message);
		}
	}

	async getMeetingStatus(meetingId) {
		try {
			// In a real implementation, you would call Zoom's API to get meeting status
			// For now, we'll return a mock response
			return {
				meetingId,
				status: 'active',
				participants: [],
				startTime: new Date(),
				duration: 0
			};
		} catch (error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting Zoom meeting status: ' + error.message);
		}
	}
}

export default new ZoomService();

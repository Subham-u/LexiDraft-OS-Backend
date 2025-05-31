import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';
import zoomService from './zoomService';

class MeetingService {
	async createMeeting(consultation) {
		try {
			// Create meeting using Zoom service
			const meeting = await zoomService.createMeeting(consultation);
			return meeting;
		} catch (error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error creating meeting: ' + error.message);
		}
	}

	async joinMeeting(meetingId, userId, userName) {
		try {
			// Join meeting using Zoom service
			const meetingDetails = await zoomService.joinMeeting(meetingId, userId, userName);
			return meetingDetails;
		} catch (error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error joining meeting: ' + error.message);
		}
	}

	async endMeeting(meetingId) {
		try {
			// End meeting using Zoom service
			const result = await zoomService.endMeeting(meetingId);
			return result;
		} catch (error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error ending meeting: ' + error.message);
		}
	}

	async getMeetingStatus(meetingId) {
		try {
			// Get meeting status using Zoom service
			const status = await zoomService.getMeetingStatus(meetingId);
			return status;
		} catch (error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error getting meeting status: ' + error.message);
		}
	}
}

export default new MeetingService();

import Lawyer from '~/models/Lawyer';
import Consultation from '~/models/Consultation';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';
import meetingService from '~/services/meetingService';

class LawyerService {
	async createLawyerProfile(userId, lawyerData) {
		const lawyer = new Lawyer({
			user: userId,
			...lawyerData
		});
		return await lawyer.save();
	}

	async getLawyerProfile(lawyerId) {
		const lawyer = await Lawyer.findById(lawyerId).populate('user', 'name email').populate('documents');

		if (!lawyer) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Lawyer not found');
		}
		return lawyer;
	}

	async updateLawyerProfile(lawyerId, updateData) {
		const lawyer = await Lawyer.findByIdAndUpdate(lawyerId, { $set: updateData }, { new: true, runValidators: true });

		if (!lawyer) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Lawyer not found');
		}
		return lawyer;
	}

	async searchLawyers(filters = {}) {
		const query = {};

		if (filters.expertise) {
			query.expertise = { $in: filters.expertise };
		}

		if (filters.stateOfPractice) {
			query.stateOfPractice = filters.stateOfPractice;
		}

		if (filters.minRating) {
			query['rating.average'] = { $gte: filters.minRating };
		}

		if (filters.isVerified) {
			query.isVerified = true;
		}

		return await Lawyer.find(query).populate('user', 'name email').sort({ 'rating.average': -1 });
	}

	async getAvailableSlots(lawyerId, date) {
		const lawyer = await Lawyer.findById(lawyerId);
		if (!lawyer) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Lawyer not found');
		}

		// Get day of week for the given date
		const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

		// Find lawyer's availability for that day
		const dayAvailability = lawyer.availability.find((a) => a.day === dayOfWeek);
		if (!dayAvailability) {
			return [];
		}

		// Get existing consultations for that day
		const existingConsultations = await Consultation.find({
			lawyer: lawyerId,
			scheduledAt: {
				$gte: new Date(date).setHours(0, 0, 0, 0),
				$lt: new Date(date).setHours(23, 59, 59, 999)
			},
			status: { $in: ['pending', 'confirmed'] }
		});

		// Filter out booked slots
		const bookedSlots = existingConsultations.map((c) => ({
			start: new Date(c.scheduledAt).toLocaleTimeString('en-US', { hour12: false }),
			end: new Date(c.scheduledAt.getTime() + c.duration * 60000).toLocaleTimeString('en-US', { hour12: false })
		}));

		return dayAvailability.slots.filter(
			(slot) =>
				!bookedSlots.some(
					(booked) =>
						(slot.start >= booked.start && slot.start < booked.end) || (slot.end > booked.start && slot.end <= booked.end)
				)
		);
	}

	async createConsultation(userId, lawyerId, consultationData) {
		const lawyer = await Lawyer.findById(lawyerId);
		if (!lawyer) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Lawyer not found');
		}

		// Verify slot availability
		const availableSlots = await this.getAvailableSlots(lawyerId, consultationData.scheduledAt);
		const slotTime = new Date(consultationData.scheduledAt).toLocaleTimeString('en-US', { hour12: false });

		const isSlotAvailable = availableSlots.some((slot) => slot.start <= slotTime && slot.end > slotTime);

		if (!isSlotAvailable) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Selected time slot is not available');
		}

		// Calculate price based on consultation type
		const price = lawyer.pricing[consultationData.type] * (consultationData.duration / 60);

		// Create consultation
		const consultation = new Consultation({
			user: userId,
			lawyer: lawyerId,
			...consultationData,
			price
		});

		// Create meeting if it's a video or chat consultation
		if (consultationData.type === 'video' || consultationData.type === 'chat') {
			const meeting = await meetingService.createMeeting(consultation);
			consultation.meetingLink = meeting.meetingLink;
			consultation.meetingId = meeting.meetingId;
		}

		return await consultation.save();
	}

	async joinConsultation(consultationId, userId) {
		const consultation = await Consultation.findById(consultationId).populate('lawyer', 'user').populate('user', 'name');

		if (!consultation) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Consultation not found');
		}

		// Verify user is either the lawyer or the client
		if (consultation.user._id.toString() !== userId && consultation.lawyer.user.toString() !== userId) {
			throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to join this consultation');
		}

		// Verify consultation is active
		if (consultation.status !== 'confirmed') {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Consultation is not active');
		}

		// Verify consultation time
		const now = new Date();
		const consultationTime = new Date(consultation.scheduledAt);
		const timeDiff = Math.abs(now - consultationTime) / 60000; // difference in minutes

		if (timeDiff > 15) {
			// Allow joining 15 minutes before/after scheduled time
			throw new ApiError(httpStatus.BAD_REQUEST, 'Consultation is not active at this time');
		}

		// Get user's name
		const userName = consultation.user._id.toString() === userId ? consultation.user.name : consultation.lawyer.user.name;

		// Get meeting details
		const meetingDetails = await meetingService.joinMeeting(consultation.meetingId, userId, userName);

		return {
			consultation,
			meetingDetails
		};
	}

	async endConsultation(consultationId, userId) {
		const consultation = await Consultation.findById(consultationId).populate('lawyer', 'user');

		if (!consultation) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Consultation not found');
		}

		// Verify user is the lawyer
		if (consultation.lawyer.user.toString() !== userId) {
			throw new ApiError(httpStatus.FORBIDDEN, 'Only the lawyer can end the consultation');
		}

		// End the meeting
		await meetingService.endMeeting(consultation.meetingId);

		// Update consultation status
		consultation.status = 'completed';
		consultation.completedAt = new Date();

		return await consultation.save();
	}

	async updateConsultationStatus(consultationId, status) {
		const consultation = await Consultation.findByIdAndUpdate(consultationId, { $set: { status } }, { new: true });

		if (!consultation) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Consultation not found');
		}
		return consultation;
	}

	async addFeedback(consultationId, userId, feedbackData) {
		const consultation = await Consultation.findById(consultationId);
		if (!consultation) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Consultation not found');
		}

		if (consultation.user.toString() !== userId) {
			throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to add feedback');
		}

		consultation.feedback = {
			...feedbackData,
			createdAt: new Date()
		};

		// Update lawyer's rating
		const lawyer = await Lawyer.findById(consultation.lawyer);
		const newRatingCount = lawyer.rating.count + 1;
		const newRatingAverage = (lawyer.rating.average * lawyer.rating.count + feedbackData.rating) / newRatingCount;

		lawyer.rating = {
			average: newRatingAverage,
			count: newRatingCount
		};

		await lawyer.save();
		return await consultation.save();
	}

	async getConsultationHistory(userId, filters = {}) {
		return await Consultation.find({ user: userId, ...filters })
			.populate('lawyer', 'user expertise')
			.populate('lawyer.user', 'name email')
			.sort({ scheduledAt: -1 });
	}
}

export default new LawyerService();

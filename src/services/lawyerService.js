import Lawyer from '~/models/Lawyer';
import Consultation from '~/models/Consultation';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';
import meetingService from '~/services/meetingService';
import Contract from '~/models/contract';
import Booking from '~/models/booking';
import Invoice from '~/models/invoice';

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

	async getDashboardStats(lawyerId) {
		const lawyer = await Lawyer.findOne({ userId: lawyerId });
		if (!lawyer) {
			throw new Error('Lawyer not found');
		}

		// Get active bookings
		const activeBookings = await Booking.find({
			lawyerId: lawyer._id,
			status: { $in: ['scheduled', 'in-progress'] }
		}).populate('clientId', 'name email');

		// Get pending contracts
		const pendingContracts = await Contract.find({
			lawyerId: lawyer._id,
			status: 'review'
		}).populate('userId', 'name email');

		// Get recent earnings
		const recentEarnings = await Invoice.find({
			lawyerId: lawyer._id,
			status: 'settled',
			createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
		}).sort({ createdAt: -1 });

		return {
			earnings: lawyer.earnings,
			activeBookings,
			pendingContracts,
			recentEarnings,
			rating: lawyer.rating,
			totalReviews: lawyer.totalReviews
		};
	}

	async updateAvailability(lawyerId, availability) {
		const lawyer = await Lawyer.findOne({ userId: lawyerId });
		if (!lawyer) {
			throw new Error('Lawyer not found');
		}

		lawyer.availability = availability;
		await lawyer.save();
		return lawyer;
	}

	async getSharedContracts(lawyerId, query) {
		const { page = 1, limit = 10, status } = query;
		const skip = (page - 1) * limit;

		const filter = { lawyerId };
		if (status) {
			filter.status = status;
		}

		const contracts = await Contract.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.populate('userId', 'name email');

		const total = await Contract.countDocuments(filter);

		return {
			contracts,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				pages: Math.ceil(total / limit)
			}
		};
	}

	async getEarningsReport(lawyerId, startDate, endDate) {
		const lawyer = await Lawyer.findOne({ userId: lawyerId });
		if (!lawyer) {
			throw new Error('Lawyer not found');
		}

		const invoices = await Invoice.find({
			lawyerId: lawyer._id,
			createdAt: {
				$gte: new Date(startDate),
				$lte: new Date(endDate)
			}
		}).sort({ createdAt: -1 });

		const totalEarnings = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
		const pendingAmount = invoices
			.filter(invoice => invoice.status === 'pending')
			.reduce((sum, invoice) => sum + invoice.amount, 0);
		const settledAmount = invoices
			.filter(invoice => invoice.status === 'settled')
			.reduce((sum, invoice) => sum + invoice.amount, 0);

		return {
			totalEarnings,
			pendingAmount,
			settledAmount,
			invoices
		};
	}

	async updateProfile(lawyerId, updateData) {
		const lawyer = await Lawyer.findOne({ userId: lawyerId });
		if (!lawyer) {
			throw new Error('Lawyer not found');
		}

		Object.assign(lawyer, updateData);
		await lawyer.save();
		return lawyer;
	}
}

export default new LawyerService();

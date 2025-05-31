import httpStatus from 'http-status';
import catchAsync from '~/utils/catchAsync';
import lawyerService from '~/services/lawyerService';

const createLawyerProfile = catchAsync(async (req, res) => {
	const lawyer = await lawyerService.createLawyerProfile(req.user.id, req.body);
	res.status(httpStatus.CREATED).send(lawyer);
});

const getLawyerProfile = catchAsync(async (req, res) => {
	const lawyer = await lawyerService.getLawyerProfile(req.params.lawyerId);
	res.send(lawyer);
});

const updateLawyerProfile = catchAsync(async (req, res) => {
	const lawyer = await lawyerService.updateLawyerProfile(req.params.lawyerId, req.body);
	res.send(lawyer);
});

const searchLawyers = catchAsync(async (req, res) => {
	const lawyers = await lawyerService.searchLawyers(req.query);
	res.send(lawyers);
});

const getAvailableSlots = catchAsync(async (req, res) => {
	const slots = await lawyerService.getAvailableSlots(req.params.lawyerId, req.query.date);
	res.send(slots);
});

const createConsultation = catchAsync(async (req, res) => {
	const consultation = await lawyerService.createConsultation(req.user.id, req.params.lawyerId, req.body);
	res.status(httpStatus.CREATED).send(consultation);
});

const updateConsultationStatus = catchAsync(async (req, res) => {
	const consultation = await lawyerService.updateConsultationStatus(req.params.consultationId, req.body.status);
	res.send(consultation);
});

const addFeedback = catchAsync(async (req, res) => {
	const consultation = await lawyerService.addFeedback(req.params.consultationId, req.user.id, req.body);
	res.send(consultation);
});

const getConsultationHistory = catchAsync(async (req, res) => {
	const consultations = await lawyerService.getConsultationHistory(req.user.id, req.query);
	res.send(consultations);
});

const joinConsultation = catchAsync(async (req, res) => {
	const result = await lawyerService.joinConsultation(req.params.consultationId, req.user.id);
	res.send(result);
});

const endConsultation = catchAsync(async (req, res) => {
	const consultation = await lawyerService.endConsultation(req.params.consultationId, req.user.id);
	res.send(consultation);
});

export default {
	createLawyerProfile,
	getLawyerProfile,
	updateLawyerProfile,
	searchLawyers,
	getAvailableSlots,
	createConsultation,
	updateConsultationStatus,
	addFeedback,
	getConsultationHistory,
	joinConsultation,
	endConsultation
};

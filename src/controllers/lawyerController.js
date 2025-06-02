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

const getDashboardStats = catchAsync(async (req, res) => {
	const stats = await lawyerService.getDashboardStats(req.user.id);
	res.status(httpStatus.OK).send({
		success: true,
		data: stats
	});
});

const updateAvailability = catchAsync(async (req, res) => {
	const { availability } = req.body;
	const lawyer = await lawyerService.updateAvailability(req.user.id, availability);
	res.status(httpStatus.OK).send({
		success: true,
		data: lawyer
	});
});

const getSharedContracts = catchAsync(async (req, res) => {
	const contracts = await lawyerService.getSharedContracts(req.user.id, req.query);
	res.status(httpStatus.OK).send({
		success: true,
		data: contracts
	});
});

const getEarningsReport = catchAsync(async (req, res) => {
	const { startDate, endDate } = req.query;
	const report = await lawyerService.getEarningsReport(req.user.id, startDate, endDate);
	res.status(httpStatus.OK).send({
		success: true,
		data: report
	});
});

const updateProfile = catchAsync(async (req, res) => {
	const lawyer = await lawyerService.updateProfile(req.user.id, req.body);
	res.status(httpStatus.OK).send({
		success: true,
		data: lawyer
	});
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
	endConsultation,
	getDashboardStats,
	updateAvailability,
	getSharedContracts,
	getEarningsReport,
	updateProfile
};

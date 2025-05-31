import legalStampService from '~/services/legalStampService';
import catchAsync from '~/utils/catchAsync';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';

const createStamp = catchAsync(async (req, res) => {
	const stamp = await legalStampService.createStamp({
		...req.body,
		owner: req.user.id
	});
	res.status(httpStatus.CREATED).send(stamp);
});

const generateStamp = catchAsync(async (req, res) => {
	const stamp = await legalStampService.generateStamp(req.params.stampId);
	res.send(stamp);
});

const attachStamp = catchAsync(async (req, res) => {
	const stamp = await legalStampService.attachStamp(req.params.stampId);
	res.send(stamp);
});

const initiateAadhaarSigning = catchAsync(async (req, res) => {
	const stamp = await legalStampService.initiateAadhaarSigning(req.params.stampId, req.user.id);
	res.send(stamp);
});

const verifyAadhaarOTP = catchAsync(async (req, res) => {
	const { otp } = req.body;
	const stamp = await legalStampService.verifyAadhaarOTP(req.params.stampId, req.user.id, otp);
	res.send(stamp);
});

const uploadDSC = catchAsync(async (req, res) => {
	if (!req.file) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'DSC file is required');
	}
	const stamp = await legalStampService.uploadDSC(req.params.stampId, req.user.id, req.file);
	res.send(stamp);
});

const verifyStamp = catchAsync(async (req, res) => {
	const { remarks } = req.body;
	const stamp = await legalStampService.verifyStamp(req.params.stampId, req.user.id, remarks);
	res.send(stamp);
});

const getStampById = catchAsync(async (req, res) => {
	const stamp = await legalStampService.getStampById(req.params.stampId);
	res.send(stamp);
});

const getStampsByOwner = catchAsync(async (req, res) => {
	const stamps = await legalStampService.getStampsByOwner(req.user.id, req.query);
	res.send(stamps);
});

const updateStamp = catchAsync(async (req, res) => {
	const stamp = await legalStampService.updateStamp(req.params.stampId, req.body);
	res.send(stamp);
});

const deleteStamp = catchAsync(async (req, res) => {
	await legalStampService.deleteStamp(req.params.stampId);
	res.status(httpStatus.NO_CONTENT).send();
});

export default {
	createStamp,
	generateStamp,
	attachStamp,
	initiateAadhaarSigning,
	verifyAadhaarOTP,
	uploadDSC,
	verifyStamp,
	getStampById,
	getStampsByOwner,
	updateStamp,
	deleteStamp
};

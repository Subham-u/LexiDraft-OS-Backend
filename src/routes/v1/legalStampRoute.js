import { Router } from 'express';
import authenticate from '~/middlewares/authenticate';
import validate from '~/middlewares/validate';
import legalStampValidation from '~/validations/legalStampValidation';
import legalStampController from '~/controllers/legalStampController';
import catchAsync from '~/utils/catchAsync';
import { uploadDSC } from '~/middlewares/upload';

const router = Router();

router
	.route('/')
	.post(authenticate(), validate(legalStampValidation.createStamp), catchAsync(legalStampController.createStamp))
	.get(authenticate(), validate(legalStampValidation.getStampsByOwner), catchAsync(legalStampController.getStampsByOwner));

router
	.route('/:stampId')
	.get(authenticate(), validate(legalStampValidation.getStampById), catchAsync(legalStampController.getStampById))
	.patch(authenticate(), validate(legalStampValidation.updateStamp), catchAsync(legalStampController.updateStamp))
	.delete(authenticate(), validate(legalStampValidation.deleteStamp), catchAsync(legalStampController.deleteStamp));

router
	.route('/:stampId/generate')
	.post(authenticate(), validate(legalStampValidation.generateStamp), catchAsync(legalStampController.generateStamp));

router
	.route('/:stampId/attach')
	.post(authenticate(), validate(legalStampValidation.attachStamp), catchAsync(legalStampController.attachStamp));

router
	.route('/:stampId/aadhaar/initiate')
	.post(
		authenticate(),
		validate(legalStampValidation.initiateAadhaarSigning),
		catchAsync(legalStampController.initiateAadhaarSigning)
	);

router
	.route('/:stampId/aadhaar/verify')
	.post(authenticate(), validate(legalStampValidation.verifyAadhaarOTP), catchAsync(legalStampController.verifyAadhaarOTP));

router
	.route('/:stampId/dsc')
	.post(
		authenticate(),
		validate(legalStampValidation.uploadDSC),
		uploadDSC.single('dsc'),
		catchAsync(legalStampController.uploadDSC)
	);

router
	.route('/:stampId/verify')
	.post(authenticate(), validate(legalStampValidation.verifyStamp), catchAsync(legalStampController.verifyStamp));

export default router;

import { Router } from 'express';
import authenticate from '~/middlewares/authenticate';
import validate from '~/middlewares/validate';
import lawyerValidation from '~/validations/lawyerValidation';
import lawyerController from '~/controllers/lawyerController';
import catchAsync from '~/utils/catchAsync';

const router = Router();

// Lawyer profile routes
router
	.route('/')
	.post(authenticate(), validate(lawyerValidation.createLawyer), catchAsync(lawyerController.createLawyerProfile))
	.get(authenticate(), validate(lawyerValidation.searchLawyers), catchAsync(lawyerController.searchLawyers));

router
	.route('/:lawyerId')
	.get(authenticate(), catchAsync(lawyerController.getLawyerProfile))
	.patch(authenticate(), validate(lawyerValidation.updateLawyer), catchAsync(lawyerController.updateLawyerProfile));

// Availability routes
router.route('/:lawyerId/slots').get(authenticate(), catchAsync(lawyerController.getAvailableSlots));

// Consultation routes
router
	.route('/:lawyerId/consultations')
	.post(authenticate(), validate(lawyerValidation.createConsultation), catchAsync(lawyerController.createConsultation));

router
	.route('/consultations/:consultationId')
	.patch(
		authenticate(),
		validate(lawyerValidation.updateConsultationStatus),
		catchAsync(lawyerController.updateConsultationStatus)
	);

router.route('/consultations/:consultationId/join').post(authenticate(), catchAsync(lawyerController.joinConsultation));

router.route('/consultations/:consultationId/end').post(authenticate(), catchAsync(lawyerController.endConsultation));

router
	.route('/consultations/:consultationId/feedback')
	.post(authenticate(), validate(lawyerValidation.addFeedback), catchAsync(lawyerController.addFeedback));

router.route('/consultations').get(authenticate(), catchAsync(lawyerController.getConsultationHistory));

export default router;

import { Router } from 'express';
import authenticate from '~/middlewares/authenticate';
import validate from '~/middlewares/validate';
import clientPortalValidation from '~/validations/clientPortalValidation';
import clientPortalController from '~/controllers/clientPortalController';
import catchAsync from '~/utils/catchAsync';

const router = Router();

router
	.route('/')
	.post(authenticate(), validate(clientPortalValidation.createPortal), catchAsync(clientPortalController.createPortal))
	.get(authenticate(), validate(clientPortalValidation.getPortalsByOwner), catchAsync(clientPortalController.getPortalsByOwner));

router
	.route('/:portalId')
	.patch(authenticate(), validate(clientPortalValidation.updatePortal), catchAsync(clientPortalController.updatePortal))
	.delete(authenticate(), validate(clientPortalValidation.deletePortal), catchAsync(clientPortalController.deletePortal));

router
	.route('/:portalId/status')
	.patch(
		authenticate(),
		validate(clientPortalValidation.updatePortalStatus),
		catchAsync(clientPortalController.updatePortalStatus)
	);

router
	.route('/:portalId/comments')
	.post(authenticate(), validate(clientPortalValidation.addComment), catchAsync(clientPortalController.addComment));

router
	.route('/:portalId/signatures')
	.post(authenticate(), validate(clientPortalValidation.addSignature), catchAsync(clientPortalController.addSignature));

router
	.route('/:portalId/reminders')
	.post(authenticate(), validate(clientPortalValidation.sendReminder), catchAsync(clientPortalController.sendReminder));

router
	.route('/:portalId/timeline')
	.get(authenticate(), validate(clientPortalValidation.getTimeline), catchAsync(clientPortalController.getTimeline));

router
	.route('/token/:token')
	.get(validate(clientPortalValidation.getPortalByToken), catchAsync(clientPortalController.getPortalByToken));

export default router;

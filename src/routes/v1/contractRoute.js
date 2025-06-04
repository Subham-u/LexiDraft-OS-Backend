import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import authenticate from '~/middlewares/authenticate';
import contractController from '~/controllers/contractController';
import validate from '~/middlewares/validate';
import contractValidation from '~/validations/contractValidation';

const router = Router();

// Contract CRUD operations
router.post('/', authenticate(), validate(contractValidation.createContract), catchAsync(contractController.createContract));
router.post(
	'/generate',
	authenticate(),
	validate(contractValidation.generateAIContract),
	catchAsync(contractController.generateAIContract)
);

router.put(
	'/:contractId',
	authenticate(),
	validate(contractValidation.updateGeneratedContract),
	catchAsync(contractController.updateGeneratedContract)
);

router.get('/:contractId', authenticate(), validate(contractValidation.getContract), catchAsync(contractController.getContract));
router.get('/', authenticate(), validate(contractValidation.getUserContracts), catchAsync(contractController.getUserContracts));
// router.put(
// 	'/:contractId',
// 	authenticate(),
// 	validate(contractValidation.updateContract),
// 	catchAsync(contractController.updateContract)
// );
router.delete(
	'/:contractId',
	authenticate(),
	validate(contractValidation.deleteContract),
	catchAsync(contractController.deleteContract)
);

// AI-powered contract operations
router.post(
	'/generate-sections',
	authenticate(),
	validate(contractValidation.generateSections),
	catchAsync(contractController.generateContractSections)
);
router.post(
	'/rewrite-section',
	authenticate(),
	validate(contractValidation.rewriteSection),
	catchAsync(contractController.rewriteSection)
);
router.post(
	'/suggest-clause',
	authenticate(),
	validate(contractValidation.suggestClause),
	catchAsync(contractController.suggestClause)
);

// Shareable contract routes
router.post(
	'/:contractId/share',
	authenticate(),
	validate(contractValidation.generateShareableLink),
	catchAsync(contractController.generateShareableLink)
);

router.get(
	'/shared/:shareToken',
	authenticate(),
	validate(contractValidation.accessSharedContract),
	catchAsync(contractController.accessSharedContract)
);

// Access request routes
router.post(
	'/shared/:shareToken/request',
	validate(contractValidation.requestContractAccess),
	catchAsync(contractController.requestContractAccess)
);

router.put(
	'/shared/:shareToken/request/:email',
	authenticate(),
	validate(contractValidation.updateAccessRequest),
	catchAsync(contractController.updateAccessRequest)
);

// Contract analysis route
router.post(
	'/:contractId/analyze',
	authenticate(),
	validate(contractValidation.analyzeContract),
	catchAsync(contractController.analyzeContract)
);

// Contract template routes
router.post(
	'/:contractId/save-template',
	authenticate(),
	validate(contractValidation.saveAsTemplate),
	catchAsync(contractController.saveAsTemplate)
);

export default router;

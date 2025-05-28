import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import authenticate from '~/middlewares/authenticate';
import contractController from '~/controllers/contractController';
import validate from '~/middlewares/validate';
import contractValidation from '~/validations/contractValidation';

const router = Router();

// Contract CRUD operations
router.post('/', authenticate(), validate(contractValidation.createContract), catchAsync(contractController.createContract));
router.get('/:contractId', authenticate(), validate(contractValidation.getContract), catchAsync(contractController.getContract));
router.get('/', authenticate(), validate(contractValidation.getUserContracts), catchAsync(contractController.getUserContracts));
router.put(
	'/:contractId',
	authenticate(),
	validate(contractValidation.updateContract),
	catchAsync(contractController.updateContract)
);
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

export default router;

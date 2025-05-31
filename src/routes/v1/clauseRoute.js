import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import clauseValidation from '~/validations/clauseValidation';
import clauseController from '~/controllers/clauseController';
import authenticate from '~/middlewares/authenticate';

const router = Router();

// Search clauses
router.get('/search', authenticate(), validate(clauseValidation.searchClauses), catchAsync(clauseController.searchClauses));

// Get clauses by category
router.get(
	'/category/:category',
	authenticate(),
	validate(clauseValidation.getClausesByCategory),
	catchAsync(clauseController.getClausesByCategory)
);

// Get must-have clauses for a contract type
router.get(
	'/must-have/:contractType',
	authenticate(),
	validate(clauseValidation.getMustHaveClauses),
	catchAsync(clauseController.getMustHaveClauses)
);

// Create new clause
router.post('/', authenticate(), validate(clauseValidation.createClause), catchAsync(clauseController.createClause));

// Update clause
router.put('/:id', authenticate(), validate(clauseValidation.updateClause), catchAsync(clauseController.updateClause));

// Delete clause
router.delete('/:id', authenticate(), validate(clauseValidation.deleteClause), catchAsync(clauseController.deleteClause));

// Rewrite clause in different tone
router.post('/:id/rewrite', authenticate(), validate(clauseValidation.rewriteClause), catchAsync(clauseController.rewriteClause));

export default router;

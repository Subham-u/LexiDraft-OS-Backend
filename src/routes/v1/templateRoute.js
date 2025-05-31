import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import templateValidation from '~/validations/templateValidation';
import templateController from '~/controllers/templateController';
import authenticate from '~/middlewares/authenticate';

const router = Router();

// Search templates
router.get(
	'/search',
	authenticate(),
	validate(templateValidation.searchTemplates),
	catchAsync(templateController.searchTemplates)
);

// Get templates by category
router.get(
	'/category/:category',
	authenticate(),
	validate(templateValidation.getTemplatesByCategory),
	catchAsync(templateController.getTemplatesByCategory)
);

// Get templates by industry
router.get(
	'/industry/:industry',
	authenticate(),
	validate(templateValidation.getTemplatesByIndustry),
	catchAsync(templateController.getTemplatesByIndustry)
);

// Get template by ID
router.get('/:id', authenticate(), catchAsync(templateController.getTemplateById));

// Create new template
router.post('/', authenticate(), validate(templateValidation.createTemplate), catchAsync(templateController.createTemplate));

// Update template
router.put('/:id', authenticate(), validate(templateValidation.updateTemplate), catchAsync(templateController.updateTemplate));

// Delete template
router.delete('/:id', authenticate(), validate(templateValidation.deleteTemplate), catchAsync(templateController.deleteTemplate));

// Add review to template
router.post('/:id/reviews', authenticate(), validate(templateValidation.addReview), catchAsync(templateController.addReview));

// Get popular templates
router.get(
	'/popular',
	authenticate(),
	validate(templateValidation.getPopularTemplates),
	catchAsync(templateController.getPopularTemplates)
);

// Get templates by enforceability
router.get(
	'/enforceability/:enforceability',
	authenticate(),
	validate(templateValidation.getTemplatesByEnforceability),
	catchAsync(templateController.getTemplatesByEnforceability)
);

export default router;

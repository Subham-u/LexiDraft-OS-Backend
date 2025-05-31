import templateService from '~/services/templateService';
import { validateTemplate } from '~/validations/templateValidation';

class TemplateController {
	async searchTemplates(req, res) {
		try {
			const { query, category, industry, jurisdiction, enforceability } = req.query;
			const filters = {};

			if (category) filters.category = category;
			if (industry) filters.industry = industry;
			if (jurisdiction) filters.jurisdiction = jurisdiction;
			if (enforceability) filters.enforceability = enforceability;

			const templates = await templateService.searchTemplates(query, filters);
			res.json({ success: true, data: templates });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async getTemplatesByCategory(req, res) {
		try {
			const { category } = req.params;
			const { industry, jurisdiction, enforceability } = req.query;
			const filters = {};

			if (industry) filters.industry = industry;
			if (jurisdiction) filters.jurisdiction = jurisdiction;
			if (enforceability) filters.enforceability = enforceability;

			const templates = await templateService.getTemplatesByCategory(category, filters);
			res.json({ success: true, data: templates });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async getTemplatesByIndustry(req, res) {
		try {
			const { industry } = req.params;
			const { category, jurisdiction, enforceability } = req.query;
			const filters = {};

			if (category) filters.category = category;
			if (jurisdiction) filters.jurisdiction = jurisdiction;
			if (enforceability) filters.enforceability = enforceability;

			const templates = await templateService.getTemplatesByIndustry(industry, filters);
			res.json({ success: true, data: templates });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async getTemplateById(req, res) {
		try {
			const { id } = req.params;
			const template = await templateService.getTemplateById(id);
			if (!template) {
				return res.status(404).json({ success: false, error: 'Template not found' });
			}
			res.json({ success: true, data: template });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async createTemplate(req, res) {
		try {
			const validation = validateTemplate(req.body);
			if (!validation.success) {
				return res.status(400).json({ success: false, error: validation.error });
			}

			const template = await templateService.createTemplate({
				...req.body,
				createdBy: req.user._id
			});
			res.status(201).json({ success: true, data: template });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async updateTemplate(req, res) {
		try {
			const { id } = req.params;
			const validation = validateTemplate(req.body);
			if (!validation.success) {
				return res.status(400).json({ success: false, error: validation.error });
			}

			const template = await templateService.updateTemplate(id, req.body);
			if (!template) {
				return res.status(404).json({ success: false, error: 'Template not found' });
			}
			res.json({ success: true, data: template });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async deleteTemplate(req, res) {
		try {
			const { id } = req.params;
			const template = await templateService.deleteTemplate(id);
			if (!template) {
				return res.status(404).json({ success: false, error: 'Template not found' });
			}
			res.json({ success: true, message: 'Template deleted successfully' });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async addReview(req, res) {
		try {
			const { id } = req.params;
			const reviewData = {
				...req.body,
				user: req.user._id
			};
			const template = await templateService.addReview(id, reviewData);
			res.json({ success: true, data: template });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async getPopularTemplates(req, res) {
		try {
			const { limit } = req.query;
			const templates = await templateService.getPopularTemplates(parseInt(limit, 10));
			res.json({ success: true, data: templates });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}

	async getTemplatesByEnforceability(req, res) {
		try {
			const { enforceability } = req.params;
			const templates = await templateService.getTemplatesByEnforceability(enforceability);
			res.json({ success: true, data: templates });
		} catch (error) {
			res.status(500).json({ success: false, error: error.message });
		}
	}
}

export default new TemplateController();

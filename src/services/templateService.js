import Template from '~/models/Template';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';

class TemplateService {
	async searchTemplates(query, filters = {}) {
		const searchQuery = {
			$or: [{ title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }],
			...filters
		};
		return await Template.find(searchQuery).populate('category').populate('industry').sort({ createdAt: -1 });
	}

	async getTemplatesByCategory(category, filters = {}) {
		return await Template.find({ category, ...filters })
			.populate('category')
			.populate('industry')
			.sort({ createdAt: -1 });
	}

	async getTemplatesByIndustry(industry, filters = {}) {
		return await Template.find({ industry, ...filters })
			.populate('category')
			.populate('industry')
			.sort({ createdAt: -1 });
	}

	async getTemplateById(id) {
		const template = await Template.findById(id).populate('category').populate('industry').populate('reviews.user', 'name email');

		if (!template) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
		}
		return template;
	}

	async createTemplate(templateData) {
		const template = new Template(templateData);
		return await template.save();
	}

	async updateTemplate(id, updateData) {
		const template = await Template.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

		if (!template) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
		}
		return template;
	}

	async deleteTemplate(id) {
		const template = await Template.findByIdAndDelete(id);
		if (!template) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
		}
		return template;
	}

	async addReview(templateId, reviewData) {
		const template = await Template.findById(templateId);
		if (!template) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
		}

		template.reviews.push(reviewData);
		return await template.save();
	}

	async getPopularTemplates(limit = 10) {
		return await Template.find()
			.sort({ 'reviews.rating': -1, 'reviews.length': -1 })
			.limit(limit)
			.populate('category')
			.populate('industry');
	}

	async getTemplatesByEnforceability(enforceability) {
		return await Template.find({ enforceability }).populate('category').populate('industry').sort({ createdAt: -1 });
	}
}

export default new TemplateService();

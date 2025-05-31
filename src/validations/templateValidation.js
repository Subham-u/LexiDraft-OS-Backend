import Joi from 'joi';

const variableSchema = Joi.object({
	name: Joi.string().required(),
	type: Joi.string().valid('text', 'number', 'date', 'boolean', 'select').default('text'),
	required: Joi.boolean(),
	defaultValue: Joi.string(),
	options: Joi.array().items(Joi.string()),
	description: Joi.string()
});

const reviewSchema = Joi.object({
	rating: Joi.number().min(0).max(5).required(),
	comment: Joi.string().max(500)
});

const templateSchema = Joi.object({
	title: Joi.string().required().min(3).max(200),
	description: Joi.string().required().min(10).max(1000),
	content: Joi.string().required().min(50),
	category: Joi.string()
		.required()
		.valid(
			'Freelance',
			'Vendor',
			'Rental',
			'Employment',
			'NDA',
			'Service Agreement',
			'Partnership',
			'Consulting',
			'Software License',
			'Distribution',
			'Franchise',
			'Joint Venture',
			'Merger',
			'Acquisition',
			'Lease',
			'Loan',
			'Investment',
			'Agency',
			'Marketing',
			'Research'
		),
	industry: Joi.string()
		.required()
		.valid(
			'Technology',
			'Healthcare',
			'Finance',
			'Real Estate',
			'Manufacturing',
			'Retail',
			'Education',
			'Entertainment',
			'Construction',
			'Transportation',
			'Energy',
			'Agriculture',
			'Hospitality',
			'Professional Services',
			'Media',
			'Telecommunications'
		),
	jurisdiction: Joi.string().required(),
	enforceability: Joi.string().valid('High', 'Medium', 'Low').default('Medium'),
	tags: Joi.array().items(Joi.string()),
	variables: Joi.array().items(variableSchema),
	version: Joi.string(),
	isPublic: Joi.boolean()
});

const validateTemplate = (data) => {
	const { error, value } = templateSchema.validate(data, {
		abortEarly: false,
		stripUnknown: true
	});

	if (error) {
		return {
			success: false,
			error: error.details.map((detail) => detail.message).join(', ')
		};
	}

	return { success: true, value };
};

const searchTemplates = {
	query: Joi.object({
		query: Joi.string(),
		category: Joi.string(),
		industry: Joi.string(),
		jurisdiction: Joi.string(),
		enforceability: Joi.string().valid('High', 'Medium', 'Low')
	})
};

const getTemplatesByCategory = {
	params: Joi.object({
		category: Joi.string().required()
	}),
	query: Joi.object({
		industry: Joi.string(),
		jurisdiction: Joi.string(),
		enforceability: Joi.string().valid('High', 'Medium', 'Low')
	})
};

const getTemplatesByIndustry = {
	params: Joi.object({
		industry: Joi.string().required()
	}),
	query: Joi.object({
		category: Joi.string(),
		jurisdiction: Joi.string(),
		enforceability: Joi.string().valid('High', 'Medium', 'Low')
	})
};

const createTemplate = {
	body: templateSchema
};

const updateTemplate = {
	params: Joi.object({
		id: Joi.string().required()
	}),
	body: templateSchema
};

const deleteTemplate = {
	params: Joi.object({
		id: Joi.string().required()
	})
};

const addReview = {
	params: Joi.object({
		id: Joi.string().required()
	}),
	body: reviewSchema
};

const getPopularTemplates = {
	query: Joi.object({
		limit: Joi.number().integer().min(1).max(50)
	})
};

const getTemplatesByEnforceability = {
	params: Joi.object({
		enforceability: Joi.string().valid('High', 'Medium', 'Low').required()
	})
};

export default {
	validateTemplate,
	searchTemplates,
	getTemplatesByCategory,
	getTemplatesByIndustry,
	createTemplate,
	updateTemplate,
	deleteTemplate,
	addReview,
	getPopularTemplates,
	getTemplatesByEnforceability
};

const Joi = require('joi');

const clauseSchema = Joi.object({
	title: Joi.string().required().min(3).max(200),
	content: Joi.string().required().min(10),
	category: Joi.string()
		.required()
		.valid('IP', 'Liability', 'Termination', 'Confidentiality', 'General', 'Payment', 'Warranty', 'Indemnification'),
	jurisdiction: Joi.string().required(),
	useCases: Joi.array().items(Joi.string()),
	keywords: Joi.array().items(Joi.string()),
	isMustHave: Joi.boolean(),
	contractTypes: Joi.array().items(Joi.string()),
	tone: Joi.string().valid('Formal', 'Neutral', 'Friendly', 'Strict'),
	version: Joi.string(),
	isPublic: Joi.boolean()
});

const validateClause = (data) => {
	const { error, value } = clauseSchema.validate(data, {
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

module.exports = {
	validateClause
};

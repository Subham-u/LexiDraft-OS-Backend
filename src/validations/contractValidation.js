import Joi from 'joi';
import { mongoId } from './customValidation';

const createContract = {
	body: Joi.object().keys({
		title: Joi.string().min(3).max(200).required(),
		type: Joi.string().valid('service', 'employment', 'nda', 'partnership', 'other').required(),
		description: Joi.string().min(10).max(2000).required(),
		parties: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsed = JSON.parse(value);
					if (!Array.isArray(parsed)) {
						return helpers.error('any.invalid');
					}
					// Validate each party object structure
					const partySchema = Joi.object({
						name: Joi.string().required(),
						role: Joi.string().required(),
						email: Joi.string().email().required(),
						aadhaar: Joi.string()
							.pattern(/^\d{12}$/)
							.required(),
						dsc: Joi.object({
							serialNumber: Joi.string().required(),
							validFrom: Joi.date().iso().required(),
							validTo: Joi.date().iso().required()
						}).required()
					});
					const { error } = Joi.array().items(partySchema).validate(parsed);
					if (error) {
						return helpers.error('any.invalid');
					}
					return value;
				} catch (e) {
					return helpers.error('any.invalid');
				}
			})
			.required(),
		jurisdiction: Joi.string().min(2).max(100).required(),
		startDate: Joi.date().iso().required(),
		endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
		content: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsed = JSON.parse(value);
					const contentSchema = Joi.object({
						clauses: Joi.array()
							.items(
								Joi.object({
									title: Joi.string().required(),
									content: Joi.string().required(),
									order: Joi.number().required()
								})
							)
							.required(),
						appearance: Joi.object({
							font: Joi.string(),
							spacing: Joi.number(),
							margins: Joi.object()
						}).required(),
						aiResponses: Joi.array()
							.items(
								Joi.object({
									query: Joi.string().required(),
									response: Joi.string().required(),
									timestamp: Joi.date().iso().required()
								})
							)
							.required(),
						conversationSummary: Joi.string().required()
					});
					const { error } = contentSchema.validate(parsed);
					if (error) {
						return helpers.error('any.invalid');
					}
					return value;
				} catch (e) {
					return helpers.error('any.invalid');
				}
			})
			.required()
	})
};

const getContract = {
	params: Joi.object().keys({
		contractId: Joi.string().custom(mongoId)
	})
};

const getUserContracts = {
	query: Joi.object().keys({
		page: Joi.number().integer(),
		limit: Joi.number().integer(),
		sortBy: Joi.string(),
		sortOrder: Joi.string().valid('asc', 'desc')
	})
};

const updateContract = {
	params: Joi.object().keys({
		contractId: Joi.string().custom(mongoId)
	}),
	body: Joi.object()
		.keys({
			title: Joi.string(),
			type: Joi.string(),
			parties: Joi.array().items(
				Joi.object().keys({
					name: Joi.string().required(),
					role: Joi.string().required()
				})
			),
			sections: Joi.array().items(
				Joi.object().keys({
					title: Joi.string().required(),
					content: Joi.string().required(),
					order: Joi.number().required()
				})
			),
			status: Joi.string().valid('draft', 'review', 'final')
		})
		.min(1)
};

const deleteContract = {
	params: Joi.object().keys({
		contractId: Joi.string().custom(mongoId)
	})
};

const generateSections = {
	body: Joi.object().keys({
		contractType: Joi.string().required(),
		parties: Joi.array()
			.items(
				Joi.object().keys({
					name: Joi.string().required(),
					role: Joi.string().required()
				})
			)
			.required()
	})
};

const rewriteSection = {
	body: Joi.object().keys({
		sectionContent: Joi.string().required(),
		style: Joi.string().required()
	})
};

const suggestClause = {
	body: Joi.object().keys({
		context: Joi.string().required(),
		type: Joi.string().required()
	})
};

const generateAIContract = {
	body: Joi.object().keys({
		title: Joi.string().min(3).max(200).required(),
		type: Joi.string().valid('service', 'employment', 'nda', 'partnership', 'other').required(),
		description: Joi.string().min(10).max(2000).required(),
		parties: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsed = JSON.parse(value);
					if (!Array.isArray(parsed)) {
						return helpers.error('any.invalid');
					}
					const partySchema = Joi.object({
						name: Joi.string().required(),
						role: Joi.string().required(),
						email: Joi.string().email().required(),
						aadhaar: Joi.string()
							.pattern(/^\d{12}$/)
							.required(),
						dsc: Joi.object({
							serialNumber: Joi.string().required(),
							validFrom: Joi.date().iso().required(),
							validTo: Joi.date().iso().required()
						}).required()
					});
					const { error } = Joi.array().items(partySchema).validate(parsed);
					if (error) {
						return helpers.error('any.invalid');
					}
					return value;
				} catch (e) {
					return helpers.error('any.invalid');
				}
			})
			.required(),
		jurisdiction: Joi.string().min(2).max(100).required(),
		startDate: Joi.date().iso().required(),
		endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
		content: Joi.string()
			.custom((value, helpers) => {
				try {
					const parsed = JSON.parse(value);
					const contentSchema = Joi.object({
						clauses: Joi.array()
							.items(
								Joi.object({
									title: Joi.string().required(),
									content: Joi.string().required(),
									order: Joi.number().required()
								})
							)
							.required(),
						appearance: Joi.object({
							font: Joi.string(),
							spacing: Joi.number(),
							logo: Joi.string(),
							margins: Joi.object()
						}).required(),
						conversationSummary: Joi.string().required()
					});
					const { error } = contentSchema.validate(parsed);
					if (error) {
						return helpers.error('any.invalid');
					}
					return value;
				} catch (e) {
					return helpers.error('any.invalid');
				}
			})
			.required(),
		aiPreferences: Joi.object({
			tone: Joi.string().valid('formal', 'semi-formal', 'casual').default('formal'),
			language: Joi.string().default('en'),
			includeDefinitions: Joi.boolean().default(true),
			includeJurisdiction: Joi.boolean().default(true),
			includeDisputeResolution: Joi.boolean().default(true)
		}).default()
	})
};

export default {
	createContract,
	getContract,
	getUserContracts,
	updateContract,
	deleteContract,
	generateSections,
	rewriteSection,
	suggestClause,
	generateAIContract
};

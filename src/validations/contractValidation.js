import Joi from 'joi';
import { mongoId } from './customValidation';

const createContract = {
	body: Joi.object().keys({
		title: Joi.string().required(),
		type: Joi.string().required(),
		parties: Joi.array()
			.items(
				Joi.object().keys({
					name: Joi.string().required(),
					role: Joi.string().required()
				})
			)
			.required(),
		sections: Joi.array()
			.items(
				Joi.object().keys({
					title: Joi.string().required(),
					content: Joi.string().required(),
					order: Joi.number().required()
				})
			)
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

export default {
	createContract,
	getContract,
	getUserContracts,
	updateContract,
	deleteContract,
	generateSections,
	rewriteSection,
	suggestClause
};

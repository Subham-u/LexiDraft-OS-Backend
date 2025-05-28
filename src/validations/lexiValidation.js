import Joi from 'joi';
import { mongoId } from './customValidation';

export const createConversation = {
	body: Joi.object().keys({
		title: Joi.string().trim().min(2).max(100).required()
	})
};

export const getUserConversations = {
	query: Joi.object().keys({
		q: Joi.string(),
		sortBy: Joi.string(),
		sortDirection: Joi.string(),
		limit: Joi.number().integer(),
		page: Joi.number().integer()
	})
};

export const getConversation = {
	params: Joi.object().keys({
		conversationId: Joi.string().custom(mongoId)
	})
};

export const summarizeText = {
	body: Joi.object().keys({
		text: Joi.string().trim().min(1).max(10000).required(),
		conversationId: Joi.string().custom(mongoId)
	})
};

export const explainLegalJargon = {
	body: Joi.object().keys({
		text: Joi.string().trim().min(1).max(10000).required(),
		conversationId: Joi.string().custom(mongoId)
	})
};

export const analyzeRisks = {
	body: Joi.object().keys({
		text: Joi.string().trim().min(1).max(10000).required(),
		conversationId: Joi.string().custom(mongoId)
	})
};

export const suggestClauses = {
	body: Joi.object().keys({
		context: Joi.string().trim().min(1).max(10000).required(),
		type: Joi.string().trim().min(2).max(50).required(),
		conversationId: Joi.string().custom(mongoId)
	})
};

export const adjustTone = {
	body: Joi.object().keys({
		text: Joi.string().trim().min(1).max(10000).required(),
		targetTone: Joi.string().valid('friendly', 'strict', 'neutral').required(),
		conversationId: Joi.string().custom(mongoId)
	})
};

export default {
	createConversation,
	getUserConversations,
	getConversation,
	summarizeText,
	explainLegalJargon,
	analyzeRisks,
	suggestClauses,
	adjustTone
};

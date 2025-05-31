import Joi from 'joi';

const createPortal = {
	body: Joi.object().keys({
		title: Joi.string().required(),
		description: Joi.string(),
		documentId: Joi.string().required(),
		participants: Joi.array()
			.items(
				Joi.object().keys({
					email: Joi.string().email().required(),
					name: Joi.string().required(),
					role: Joi.string().valid('signer', 'viewer').required()
				})
			)
			.required()
	})
};

const getPortalsByOwner = {
	query: Joi.object().keys({
		page: Joi.number().integer().min(1),
		limit: Joi.number().integer().min(1),
		sortBy: Joi.string(),
		sortOrder: Joi.string().valid('asc', 'desc')
	})
};

const updatePortal = {
	params: Joi.object().keys({
		portalId: Joi.string().required()
	}),
	body: Joi.object()
		.keys({
			title: Joi.string(),
			description: Joi.string(),
			participants: Joi.array().items(
				Joi.object().keys({
					email: Joi.string().email().required(),
					name: Joi.string().required(),
					role: Joi.string().valid('signer', 'viewer').required()
				})
			)
		})
		.min(1)
};

const deletePortal = {
	params: Joi.object().keys({
		portalId: Joi.string().required()
	})
};

const updatePortalStatus = {
	params: Joi.object().keys({
		portalId: Joi.string().required()
	}),
	body: Joi.object().keys({
		status: Joi.string().valid('active', 'completed', 'cancelled').required()
	})
};

const addComment = {
	params: Joi.object().keys({
		portalId: Joi.string().required()
	}),
	body: Joi.object().keys({
		content: Joi.string().required()
	})
};

const addSignature = {
	params: Joi.object().keys({
		portalId: Joi.string().required()
	}),
	body: Joi.object().keys({
		signatureData: Joi.string().required(),
		position: Joi.object()
			.keys({
				x: Joi.number().required(),
				y: Joi.number().required(),
				page: Joi.number().integer().min(1).required()
			})
			.required()
	})
};

const sendReminder = {
	params: Joi.object().keys({
		portalId: Joi.string().required()
	}),
	body: Joi.object().keys({
		participantEmail: Joi.string().email().required(),
		message: Joi.string()
	})
};

const getTimeline = {
	params: Joi.object().keys({
		portalId: Joi.string().required()
	})
};

const getPortalByToken = {
	params: Joi.object().keys({
		token: Joi.string().required()
	})
};

export default {
	createPortal,
	getPortalsByOwner,
	updatePortal,
	deletePortal,
	updatePortalStatus,
	addComment,
	addSignature,
	sendReminder,
	getTimeline,
	getPortalByToken
};

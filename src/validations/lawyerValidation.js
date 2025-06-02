import Joi from 'joi';
import { objectId } from './custom';

const createLawyer = {
	body: Joi.object().keys({
		barCouncilNumber: Joi.string().required(),
		stateOfPractice: Joi.string().required(),
		yearOfEnrollment: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
		expertise: Joi.array().items(Joi.string()).min(1).required(),
		bio: Joi.string().required(),
		education: Joi.array()
			.items(
				Joi.object().keys({
					degree: Joi.string().required(),
					institution: Joi.string().required(),
					year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required()
				})
			)
			.min(1)
			.required(),
		experience: Joi.array()
			.items(
				Joi.object().keys({
					position: Joi.string().required(),
					organization: Joi.string().required(),
					from: Joi.date().required(),
					to: Joi.date(),
					current: Joi.boolean()
				})
			)
			.min(1)
			.required(),
		pricing: Joi.object()
			.keys({
				consultation: Joi.number().min(0).required(),
				review: Joi.number().min(0).required(),
				drafting: Joi.number().min(0).required()
			})
			.required(),
		availability: Joi.array()
			.items(
				Joi.object().keys({
					day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
					slots: Joi.array()
						.items(
							Joi.object().keys({
								start: Joi.string()
									.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
									.required(),
								end: Joi.string()
									.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
									.required()
							})
						)
						.min(1)
						.required()
				})
			)
			.min(1)
			.required()
	})
};

const updateLawyer = {
	params: Joi.object().keys({
		lawyerId: Joi.string().custom(objectId)
	}),
	body: Joi.object().keys({
		stateOfPractice: Joi.string(),
		expertise: Joi.array().items(Joi.string()),
		bio: Joi.string(),
		education: Joi.array().items(
			Joi.object().keys({
				degree: Joi.string().required(),
				institution: Joi.string().required(),
				year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required()
			})
		),
		experience: Joi.array().items(
			Joi.object().keys({
				position: Joi.string().required(),
				organization: Joi.string().required(),
				from: Joi.date().required(),
				to: Joi.date(),
				current: Joi.boolean()
			})
		),
		pricing: Joi.object().keys({
			consultation: Joi.number().min(0),
			review: Joi.number().min(0),
			drafting: Joi.number().min(0)
		}),
		availability: Joi.array().items(
			Joi.object().keys({
				day: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
				slots: Joi.array()
					.items(
						Joi.object().keys({
							start: Joi.string()
								.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
								.required(),
							end: Joi.string()
								.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
								.required()
						})
					)
					.min(1)
					.required()
			})
		)
	})
};

const searchLawyers = {
	query: Joi.object().keys({
		expertise: Joi.array().items(Joi.string()),
		stateOfPractice: Joi.string(),
		minRating: Joi.number().min(0).max(5),
		isVerified: Joi.boolean()
	})
};

const createConsultation = {
	params: Joi.object().keys({
		lawyerId: Joi.string().custom(objectId)
	}),
	body: Joi.object().keys({
		type: Joi.string().valid('video', 'chat', 'document_review', 'document_drafting').required(),
		scheduledAt: Joi.date().min('now').required(),
		duration: Joi.number().integer().min(15).max(180).required(),
		document: Joi.string().custom(objectId),
		notes: Joi.string()
	})
};

const updateConsultationStatus = {
	params: Joi.object().keys({
		consultationId: Joi.string().custom(objectId)
	}),
	body: Joi.object().keys({
		status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled').required()
	})
};

const addFeedback = {
	params: Joi.object().keys({
		consultationId: Joi.string().custom(objectId)
	}),
	body: Joi.object().keys({
		rating: Joi.number().min(1).max(5).required(),
		comment: Joi.string()
	})
};

const updateAvailability = {
	body: Joi.object().keys({
		availability: Joi.array()
			.items(
				Joi.object().keys({
					day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
					slots: Joi.array()
						.items(
							Joi.object().keys({
								startTime: Joi.string().required(),
								endTime: Joi.string().required(),
								isAvailable: Joi.boolean().default(true)
							})
						)
						.required()
				})
			)
			.required()
	})
};

const getSharedContracts = {
	query: Joi.object().keys({
		page: Joi.number().integer().min(1),
		limit: Joi.number().integer().min(1).max(100),
		status: Joi.string().valid('draft', 'review', 'final')
	})
};

const getEarningsReport = {
	query: Joi.object().keys({
		startDate: Joi.date().iso().required(),
		endDate: Joi.date().iso().min(Joi.ref('startDate')).required()
	})
};

const updateProfile = {
	body: Joi.object().keys({
		specialization: Joi.array().items(Joi.string()),
		experience: Joi.number().min(0),
		consultationFee: Joi.number().min(0),
		status: Joi.string().valid('active', 'inactive', 'suspended')
	})
};

export default {
	createLawyer,
	updateLawyer,
	searchLawyers,
	createConsultation,
	updateConsultationStatus,
	addFeedback,
	updateAvailability,
	getSharedContracts,
	getEarningsReport,
	updateProfile
};

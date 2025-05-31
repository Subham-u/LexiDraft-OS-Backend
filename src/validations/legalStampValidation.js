import Joi from 'joi';
import { mongoId } from './customValidation';

const createStamp = {
	body: Joi.object().keys({
		contract: Joi.string().custom(mongoId).required(),
		stamp: Joi.object()
			.keys({
				state: Joi.string()
					.valid(
						'Andhra Pradesh',
						'Arunachal Pradesh',
						'Assam',
						'Bihar',
						'Chhattisgarh',
						'Goa',
						'Gujarat',
						'Haryana',
						'Himachal Pradesh',
						'Jharkhand',
						'Karnataka',
						'Kerala',
						'Madhya Pradesh',
						'Maharashtra',
						'Manipur',
						'Meghalaya',
						'Mizoram',
						'Nagaland',
						'Odisha',
						'Punjab',
						'Rajasthan',
						'Sikkim',
						'Tamil Nadu',
						'Telangana',
						'Tripura',
						'Uttar Pradesh',
						'Uttarakhand',
						'West Bengal',
						'Delhi',
						'Jammu and Kashmir',
						'Ladakh',
						'Puducherry'
					)
					.required(),
				value: Joi.number().min(0).required(),
				stampType: Joi.string().valid('eStamp', 'Physical Stamp').required()
			})
			.required()
	})
};

const generateStamp = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	})
};

const attachStamp = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	})
};

const initiateAadhaarSigning = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	})
};

const verifyAadhaarOTP = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		otp: Joi.string().length(6).required()
	})
};

const uploadDSC = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	})
};

const verifyStamp = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object().keys({
		remarks: Joi.string().required()
	})
};

const getStampById = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	})
};

const getStampsByOwner = {
	query: Joi.object().keys({
		status: Joi.string().valid('draft', 'stamped', 'signed', 'completed', 'failed'),
		startDate: Joi.date(),
		endDate: Joi.date().min(Joi.ref('startDate')),
		state: Joi.string()
	})
};

const updateStamp = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	}),
	body: Joi.object()
		.keys({
			stamp: Joi.object().keys({
				state: Joi.string(),
				value: Joi.number().min(0),
				stampType: Joi.string().valid('eStamp', 'Physical Stamp')
			})
		})
		.min(1)
};

const deleteStamp = {
	params: Joi.object().keys({
		stampId: Joi.string().custom(mongoId).required()
	})
};

export default {
	createStamp,
	generateStamp,
	attachStamp,
	initiateAadhaarSigning,
	verifyAadhaarOTP,
	uploadDSC,
	verifyStamp,
	getStampById,
	getStampsByOwner,
	updateStamp,
	deleteStamp
};

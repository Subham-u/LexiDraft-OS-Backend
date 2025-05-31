import mongoose from 'mongoose';

const stampSchema = new mongoose.Schema({
	contract: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Contract',
		required: true
	},
	state: {
		type: String,
		required: true,
		enum: [
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
		]
	},
	value: {
		type: Number,
		required: true,
		min: 0
	},
	stampType: {
		type: String,
		required: true,
		enum: ['eStamp', 'Physical Stamp']
	},
	status: {
		type: String,
		enum: ['pending', 'generated', 'attached', 'failed'],
		default: 'pending'
	},
	stampNumber: String,
	generatedAt: Date,
	attachedAt: Date,
	coverPage: {
		type: String, // URL to the generated cover page
		required: true
	},
	metadata: {
		type: Map,
		of: mongoose.Schema.Types.Mixed
	}
});

const signatureSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	type: {
		type: String,
		enum: ['Aadhaar', 'DSC'],
		required: true
	},
	status: {
		type: String,
		enum: ['pending', 'completed', 'failed'],
		default: 'pending'
	},
	// For Aadhaar eSign
	aadhaarDetails: {
		transactionId: String,
		otpVerified: Boolean,
		signedAt: Date
	},
	// For DSC
	dscDetails: {
		certificateSerialNumber: String,
		validFrom: Date,
		validTo: Date,
		issuer: String,
		subject: String,
		uploadedAt: Date
	},
	signatureImage: String, // URL to the signature image
	signedAt: Date,
	metadata: {
		type: Map,
		of: mongoose.Schema.Types.Mixed
	}
});

const legalStampSchema = new mongoose.Schema({
	contract: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Contract',
		required: true
	},
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	stamp: stampSchema,
	signatures: [signatureSchema],
	status: {
		type: String,
		enum: ['draft', 'stamped', 'signed', 'completed', 'failed'],
		default: 'draft'
	},
	finalDocument: {
		type: String, // URL to the final stamped and signed document
		required: false
	},
	verificationDetails: {
		verifiedAt: Date,
		verifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		verificationStatus: {
			type: String,
			enum: ['pending', 'verified', 'failed'],
			default: 'pending'
		},
		remarks: String
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
});

// Update the updatedAt timestamp before saving
legalStampSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

// Create indexes for better search performance
legalStampSchema.index({ contract: 1 });
legalStampSchema.index({ owner: 1 });
legalStampSchema.index({ 'stamp.state': 1, 'stamp.value': 1 });
legalStampSchema.index({ status: 1 });

const LegalStamp = mongoose.model('LegalStamp', legalStampSchema);

export default LegalStamp;

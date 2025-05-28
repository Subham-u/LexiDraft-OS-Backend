import mongoose from 'mongoose';

const partySchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	address: {
		type: String,
		required: true,
		trim: true
	},
	company: {
		type: String,
		trim: true
	},
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true
	},
	role: {
		type: String,
		required: true,
		enum: ['party1', 'party2', 'witness', 'other']
	}
});

const sectionSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	content: {
		type: String,
		required: true
	},
	order: {
		type: Number,
		required: true
	},
	style: {
		font: String,
		color: String,
		spacing: Number
	},
	comments: [
		{
			text: String,
			author: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			createdAt: {
				type: Date,
				default: Date.now
			}
		}
	]
});

const contractSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	type: {
		type: String,
		required: true,
		enum: ['NDA', 'Service', 'Rental', 'Employment', 'Custom']
	},
	status: {
		type: String,
		required: true,
		enum: ['draft', 'review', 'final', 'signed'],
		default: 'draft'
	},
	parties: [partySchema],
	sections: [sectionSchema],
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	lastModifiedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	style: {
		font: {
			type: String,
			default: 'Arial'
		},
		primaryColor: {
			type: String,
			default: '#000000'
		},
		secondaryColor: {
			type: String,
			default: '#666666'
		},
		spacing: {
			type: Number,
			default: 1.5
		}
	},
	metadata: {
		effectiveDate: Date,
		expirationDate: Date,
		jurisdiction: String,
		version: {
			type: Number,
			default: 1
		}
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
contractSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;

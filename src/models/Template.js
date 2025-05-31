import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	description: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true,
		enum: [
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
		]
	},
	industry: {
		type: String,
		required: true,
		enum: [
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
		]
	},
	jurisdiction: {
		type: String,
		required: true
	},
	enforceability: {
		type: String,
		required: true,
		enum: ['High', 'Medium', 'Low'],
		default: 'Medium'
	},
	tags: [
		{
			type: String,
			trim: true
		}
	],
	variables: [
		{
			name: String,
			type: {
				type: String,
				enum: ['text', 'number', 'date', 'boolean', 'select'],
				default: 'text'
			},
			required: Boolean,
			defaultValue: String,
			options: [String], // For select type
			description: String
		}
	],
	version: {
		type: String,
		default: '1.0'
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	isPublic: {
		type: Boolean,
		default: true
	},
	usageCount: {
		type: Number,
		default: 0
	},
	rating: {
		type: Number,
		min: 0,
		max: 5,
		default: 0
	},
	reviews: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			rating: {
				type: Number,
				min: 0,
				max: 5
			},
			comment: String,
			createdAt: {
				type: Date,
				default: Date.now
			}
		}
	],
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
templateSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

// Create indexes for better search performance
templateSchema.index({ title: 'text', description: 'text', tags: 'text' });
templateSchema.index({ category: 1, industry: 1, jurisdiction: 1 });
templateSchema.index({ enforceability: 1, rating: -1 });

const Template = mongoose.model('Template', templateSchema);

export default Template;

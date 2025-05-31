import mongoose from 'mongoose';

const clauseSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		trim: true
	},
	content: {
		type: String,
		required: true
	},
	category: {
		type: String,
		required: true,
		enum: ['IP', 'Liability', 'Termination', 'Confidentiality', 'General', 'Payment', 'Warranty', 'Indemnification']
	},
	jurisdiction: {
		type: String,
		required: true
	},
	useCases: [
		{
			type: String,
			trim: true
		}
	],
	keywords: [
		{
			type: String,
			trim: true
		}
	],
	isMustHave: {
		type: Boolean,
		default: false
	},
	contractTypes: [
		{
			type: String,
			trim: true
		}
	],
	tone: {
		type: String,
		enum: ['Formal', 'Neutral', 'Friendly', 'Strict'],
		default: 'Formal'
	},
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
clauseSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

// Create indexes for better search performance
clauseSchema.index({ title: 'text', content: 'text', keywords: 'text' });
clauseSchema.index({ category: 1, jurisdiction: 1 });
clauseSchema.index({ isMustHave: 1, contractTypes: 1 });

const Clause = mongoose.model('Clause', clauseSchema);

export default Clause;

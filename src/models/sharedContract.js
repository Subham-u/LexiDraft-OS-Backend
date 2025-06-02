import mongoose from 'mongoose';
import crypto from 'crypto';

const sharedContractSchema = new mongoose.Schema(
	{
		contractId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Contract',
			required: true
		},
		shareToken: {
			type: String,
			required: true,
			unique: true,
			index: true
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		accessType: {
			type: String,
			enum: ['view', 'comment', 'edit'],
			default: 'view'
		},
		expiresAt: {
			type: Date,
			required: true
		},
		allowedEmails: [{
			type: String,
			trim: true,
			lowercase: true
		}],
		accessCount: {
			type: Number,
			default: 0
		},
		lastAccessedAt: {
			type: Date
		},
		isActive: {
			type: Boolean,
			default: true
		}
	},
	{
		timestamps: true
	}
);

// Generate a secure random token
sharedContractSchema.statics.generateToken = function() {
	return crypto.randomBytes(32).toString('hex');
};

// Check if the shared link is still valid
sharedContractSchema.methods.isValid = function() {
	return this.isActive && new Date() < this.expiresAt;
};

// Check if email is allowed to access
sharedContractSchema.methods.isEmailAllowed = function(email) {
	if (!this.allowedEmails || this.allowedEmails.length === 0) {
		return true; // No email restrictions
	}
	return this.allowedEmails.includes(email.toLowerCase());
};

// Increment access count and update last accessed timestamp
sharedContractSchema.methods.recordAccess = function() {
	this.accessCount += 1;
	this.lastAccessedAt = new Date();
	return this.save();
};

const SharedContract = mongoose.model('SharedContract', sharedContractSchema);

export default SharedContract; 
import mongoose from 'mongoose';
import crypto from 'crypto';

const accessRequestSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true
	},
	status: {
		type: String,
		enum: ['pending', 'approved', 'rejected'],
		default: 'pending'
	},
	requestedAt: {
		type: Date,
		default: Date.now
	},
	respondedAt: {
		type: Date
	},
	responseNote: {
		type: String
	}
});

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
		shareType: {
			type: String,
			enum: ['public', 'restricted'],
			required: true
		},
		allowedEmails: [
			{
				type: String,
				trim: true,
				lowercase: true
			}
		],
		accessRequests: [accessRequestSchema],
		expiresAt: {
			type: Date,
			required: true
		},
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
sharedContractSchema.statics.generateToken = function () {
	return crypto.randomBytes(32).toString('hex');
};

// Check if the shared link is still valid
sharedContractSchema.methods.isValid = function () {
	return this.isActive && new Date() < this.expiresAt;
};

// Check if email is allowed to access
sharedContractSchema.methods.isEmailAllowed = function (email) {
	if (this.shareType === 'public') {
		return true;
	}
	return this.allowedEmails.includes(email.toLowerCase());
};

// Check if email has a pending access request
sharedContractSchema.methods.hasPendingRequest = function (email) {
	return this.accessRequests.some(
		(request) => request.email.toLowerCase() === email.toLowerCase() && request.status === 'pending'
	);
};

// Add access request
sharedContractSchema.methods.addAccessRequest = async function (email) {
	if (this.hasPendingRequest(email)) {
		throw new Error('Access request already pending');
	}

	this.accessRequests.push({
		email: email.toLowerCase()
	});

	return this.save();
};

// Update access request status
sharedContractSchema.methods.updateAccessRequest = async function (email, status, responseNote = '') {
	const request = this.accessRequests.find((req) => req.email.toLowerCase() === email.toLowerCase() && req.status === 'pending');

	if (!request) {
		throw new Error('No pending request found for this email');
	}

	request.status = status;
	request.respondedAt = new Date();
	request.responseNote = responseNote;

	if (status === 'approved') {
		this.allowedEmails.push(email.toLowerCase());
	}

	return this.save();
};

// Increment access count and update last accessed timestamp
sharedContractSchema.methods.recordAccess = function () {
	this.accessCount += 1;
	this.lastAccessedAt = new Date();
	return this.save();
};

const SharedContract = mongoose.model('SharedContract', sharedContractSchema);

export default SharedContract;

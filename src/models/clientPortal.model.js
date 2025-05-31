import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const clientPortalSchema = mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true
		},
		description: {
			type: String,
			trim: true
		},
		documentId: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
			ref: 'Document'
		},
		owner: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
			ref: 'User'
		},
		status: {
			type: String,
			enum: ['active', 'completed', 'cancelled'],
			default: 'active'
		},
		token: {
			type: String,
			unique: true
		},
		participants: [
			{
				email: {
					type: String,
					required: true,
					trim: true,
					lowercase: true
				},
				name: {
					type: String,
					required: true,
					trim: true
				},
				role: {
					type: String,
					enum: ['signer', 'viewer'],
					required: true
				},
				status: {
					type: String,
					enum: ['pending', 'completed', 'declined'],
					default: 'pending'
				}
			}
		],
		comments: [
			{
				content: {
					type: String,
					required: true
				},
				user: {
					type: mongoose.SchemaTypes.ObjectId,
					ref: 'User',
					required: true
				},
				timestamp: {
					type: Date,
					default: Date.now
				}
			}
		],
		signatures: [
			{
				signatureData: {
					type: String,
					required: true
				},
				position: {
					x: {
						type: Number,
						required: true
					},
					y: {
						type: Number,
						required: true
					},
					page: {
						type: Number,
						required: true
					}
				},
				user: {
					type: mongoose.SchemaTypes.ObjectId,
					ref: 'User',
					required: true
				},
				timestamp: {
					type: Date,
					default: Date.now
				}
			}
		]
	},
	{
		timestamps: true
	}
);

// add plugin that converts mongoose to json
clientPortalSchema.plugin(toJSON);

/**
 * Generate a unique token for the portal
 */
clientPortalSchema.pre('save', async function (next) {
	const portal = this;
	if (!portal.token) {
		const { generateToken } = await import('~/utils/token');
		portal.token = await generateToken();
	}
	next();
});

/**
 * @typedef ClientPortal
 */
const ClientPortal = mongoose.model('ClientPortal', clientPortalSchema);

export default ClientPortal;

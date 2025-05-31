import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const consultationSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'User',
			required: true
		},
		lawyer: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'Lawyer',
			required: true
		},
		type: {
			type: String,
			enum: ['video', 'chat', 'document_review', 'document_drafting'],
			required: true
		},
		status: {
			type: String,
			enum: ['pending', 'confirmed', 'completed', 'cancelled'],
			default: 'pending'
		},
		scheduledAt: {
			type: Date,
			required: true
		},
		duration: {
			type: Number, // in minutes
			required: true
		},
		price: {
			type: Number,
			required: true,
			min: 0
		},
		payment: {
			status: {
				type: String,
				enum: ['pending', 'completed', 'refunded'],
				default: 'pending'
			},
			transactionId: String,
			amount: Number,
			currency: {
				type: String,
				default: 'INR'
			},
			paidAt: Date
		},
		document: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'Document'
		},
		notes: {
			type: String,
			trim: true
		},
		feedback: {
			rating: {
				type: Number,
				min: 1,
				max: 5
			},
			comment: {
				type: String,
				trim: true
			},
			createdAt: Date
		},
		meetingLink: {
			type: String
		},
		chatHistory: [
			{
				sender: {
					type: mongoose.SchemaTypes.ObjectId,
					ref: 'User',
					required: true
				},
				message: {
					type: String,
					required: true,
					trim: true
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

// Add plugins
consultationSchema.plugin(toJSON);

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation;

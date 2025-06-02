import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const availabilitySchema = new mongoose.Schema({
	day: {
		type: String,
		enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
		required: true
	},
	slots: [
		{
			startTime: {
				type: String,
				required: true
			},
			endTime: {
				type: String,
				required: true
			},
			isAvailable: {
				type: Boolean,
				default: true
			}
		}
	]
});

const lawyerSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			unique: true
		},
		specialization: [
			{
				type: String,
				required: true
			}
		],
		experience: {
			type: Number,
			required: true
		},
		barCouncilNumber: {
			type: String,
			required: true,
			unique: true
		},
		consultationFee: {
			type: Number,
			required: true
		},
		availability: [availabilitySchema],
		rating: {
			type: Number,
			default: 0
		},
		totalReviews: {
			type: Number,
			default: 0
		},
		earnings: {
			total: {
				type: Number,
				default: 0
			},
			pending: {
				type: Number,
				default: 0
			},
			settled: {
				type: Number,
				default: 0
			}
		},
		status: {
			type: String,
			enum: ['active', 'inactive', 'suspended'],
			default: 'active'
		},
		documents: [
			{
				type: {
					type: String,
					required: true
				},
				url: {
					type: String,
					required: true
				},
				verified: {
					type: Boolean,
					default: false
				}
			}
		]
	},
	{
		timestamps: true
	}
);

// Indexes for better query performance
lawyerSchema.index({ userId: 1 });
lawyerSchema.index({ specialization: 1 });
lawyerSchema.index({ status: 1 });
lawyerSchema.index({ barCouncilNumber: 1 });

// Add plugins
lawyerSchema.plugin(toJSON);

const Lawyer = mongoose.model('Lawyer', lawyerSchema);

export default Lawyer;

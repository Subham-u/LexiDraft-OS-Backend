import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true
		},
		type: {
			type: String,
			required: true,
			trim: true
		},
		description: {
			type: String,
			required: true,
			trim: true
		},
		parties: [
			{
				name: {
					type: String,
					required: true
				},
				role: {
					type: String,
					required: true
				},
				email: {
					type: String,
					required: true
				},
				aadhaar: {
					type: String,
					required: true
				},
				dsc: {
					serialNumber: {
						type: String,
						required: true
					},
					validFrom: {
						type: Date,
						required: true
					},
					validTo: {
						type: Date,
						required: true
					}
				}
			}
		],
		jurisdiction: {
			type: String,
			required: true,
			trim: true
		},
		startDate: {
			type: Date,
			required: true
		},
		endDate: {
			type: Date,
			required: true
		},
		content: {
			type: String,
			required: true
		},
		status: {
			type: String,
			enum: ['draft', 'review', 'final'],
			default: 'draft'
		},
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{
		timestamps: true
	}
);

// Indexes for better query performance
contractSchema.index({ userId: 1, createdAt: -1 });
contractSchema.index({ type: 1 });
contractSchema.index({ status: 1 });

const Contract = mongoose.model('Contract', contractSchema);

export default Contract;

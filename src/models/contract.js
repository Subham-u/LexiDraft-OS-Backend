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
		parties: [
			{
				name: {
					type: String,
					required: true
				},
				role: {
					type: String,
					required: true
				}
			}
		],
		sections: [
			{
				title: {
					type: String,
					required: true
				},
				content: {
					type: String,
					required: true
				},
				order: {
					type: Number,
					required: true
				}
			}
		],
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

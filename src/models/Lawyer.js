import mongoose from 'mongoose';
import toJSON from './plugins/toJSONPlugin';

const lawyerSchema = mongoose.Schema(
	{
		user: {
			type: mongoose.SchemaTypes.ObjectId,
			ref: 'User',
			required: true,
			unique: true
		},
		barCouncilNumber: {
			type: String,
			required: true,
			unique: true,
			trim: true
		},
		stateOfPractice: {
			type: String,
			required: true,
			trim: true
		},
		yearOfEnrollment: {
			type: Number,
			required: true
		},
		expertise: [
			{
				type: String,
				required: true,
				trim: true
			}
		],
		bio: {
			type: String,
			required: true,
			trim: true
		},
		education: [
			{
				degree: {
					type: String,
					required: true,
					trim: true
				},
				institution: {
					type: String,
					required: true,
					trim: true
				},
				year: {
					type: Number,
					required: true
				}
			}
		],
		experience: [
			{
				position: {
					type: String,
					required: true,
					trim: true
				},
				organization: {
					type: String,
					required: true,
					trim: true
				},
				from: {
					type: Date,
					required: true
				},
				to: {
					type: Date
				},
				current: {
					type: Boolean,
					default: false
				}
			}
		],
		pricing: {
			consultation: {
				type: Number,
				required: true,
				min: 0
			},
			review: {
				type: Number,
				required: true,
				min: 0
			},
			drafting: {
				type: Number,
				required: true,
				min: 0
			}
		},
		availability: [
			{
				day: {
					type: String,
					enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
					required: true
				},
				slots: [
					{
						start: {
							type: String,
							required: true
						},
						end: {
							type: String,
							required: true
						}
					}
				]
			}
		],
		rating: {
			average: {
				type: Number,
				default: 0,
				min: 0,
				max: 5
			},
			count: {
				type: Number,
				default: 0
			}
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		documents: [
			{
				type: {
					type: String,
					enum: ['barCouncil', 'identity', 'education', 'other'],
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
		],
		status: {
			type: String,
			enum: ['active', 'inactive', 'suspended'],
			default: 'active'
		}
	},
	{
		timestamps: true
	}
);

// Add plugins
lawyerSchema.plugin(toJSON);

const Lawyer = mongoose.model('Lawyer', lawyerSchema);

export default Lawyer;

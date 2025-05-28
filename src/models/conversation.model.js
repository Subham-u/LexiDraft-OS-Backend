import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
	role: {
		type: String,
		enum: ['system', 'user', 'assistant'],
		required: true
	},
	content: {
		type: String,
		required: true
	},
	timestamp: {
		type: Date,
		default: Date.now
	}
});

const conversationSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	title: {
		type: String,
		required: true
	},
	messages: [messageSchema],
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
conversationSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;

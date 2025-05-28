import OpenAI from 'openai';
import config from '~/config/config';
import Conversation from '../models/conversation.model';

const openai = new OpenAI({
	apiKey: config.openai.apiKey
});

class LexiAIService {
	async createConversation(userId, title) {
		try {
			const conversation = new Conversation({
				userId,
				title,
				messages: [
					{
						role: 'system',
						content: 'You are a legal document assistant. You help users understand, analyze, and improve legal documents.'
					}
				]
			});
			await conversation.save();
			return conversation;
		} catch (error) {
			throw new Error(`Error creating conversation: ${error.message}`);
		}
	}

	async getConversation(conversationId) {
		try {
			const conversation = await Conversation.findById(conversationId);
			if (!conversation) {
				throw new Error('Conversation not found');
			}
			return conversation;
		} catch (error) {
			throw new Error(`Error getting conversation: ${error.message}`);
		}
	}

	async getUserConversations(userId) {
		try {
			return await Conversation.find({ userId }).sort({ updatedAt: -1 });
		} catch (error) {
			throw new Error(`Error getting user conversations: ${error.message}`);
		}
	}

	async addMessage(conversationId, role, content) {
		try {
			const conversation = await Conversation.findById(conversationId);
			if (!conversation) {
				throw new Error('Conversation not found');
			}
			conversation.messages.push({ role, content });
			await conversation.save();
			return conversation;
		} catch (error) {
			throw new Error(`Error adding message: ${error.message}`);
		}
	}

	async summarizeText(text, conversationId = null) {
		try {
			const messages = [
				{
					role: 'system',
					content: 'You are a legal document assistant. Summarize the following text in a clear and concise manner.'
				},
				{
					role: 'user',
					content: text
				}
			];

			if (conversationId) {
				const conversation = await this.getConversation(conversationId);
				messages.unshift(...conversation.messages.slice(-5)); // Add last 5 messages for context
			}

			const response = await openai.chat.completions.create({
				model: 'gpt-4',
				messages,
				temperature: 0.7
			});

			const result = response.choices[0].message.content;

			if (conversationId) {
				await this.addMessage(conversationId, 'assistant', result);
			}

			return result;
		} catch (error) {
			throw new Error(`Error summarizing text: ${error.message}`);
		}
	}

	async explainLegalJargon(text, conversationId = null) {
		try {
			const messages = [
				{
					role: 'system',
					content: 'You are a legal document assistant. Explain the following legal terms and concepts in plain English.'
				},
				{
					role: 'user',
					content: text
				}
			];

			if (conversationId) {
				const conversation = await this.getConversation(conversationId);
				messages.unshift(...conversation.messages.slice(-5));
			}

			const response = await openai.chat.completions.create({
				model: 'gpt-4',
				messages,
				temperature: 0.7
			});

			const result = response.choices[0].message.content;

			if (conversationId) {
				await this.addMessage(conversationId, 'assistant', result);
			}

			return result;
		} catch (error) {
			throw new Error(`Error explaining legal jargon: ${error.message}`);
		}
	}

	async analyzeRisks(text, conversationId = null) {
		try {
			const messages = [
				{
					role: 'system',
					content:
						'You are a legal document assistant. Analyze the following text for potential risks, missing clauses, and enforceability concerns.'
				},
				{
					role: 'user',
					content: text
				}
			];

			if (conversationId) {
				const conversation = await this.getConversation(conversationId);
				messages.unshift(...conversation.messages.slice(-5));
			}

			const response = await openai.chat.completions.create({
				model: 'gpt-4',
				messages,
				temperature: 0.7
			});

			const result = response.choices[0].message.content;

			if (conversationId) {
				await this.addMessage(conversationId, 'assistant', result);
			}

			return result;
		} catch (error) {
			throw new Error(`Error analyzing risks: ${error.message}`);
		}
	}

	async suggestClauses(context, type, conversationId = null) {
		try {
			const messages = [
				{
					role: 'system',
					content: `You are a legal document assistant. Suggest appropriate ${type} clauses based on the following context.`
				},
				{
					role: 'user',
					content: context
				}
			];

			if (conversationId) {
				const conversation = await this.getConversation(conversationId);
				messages.unshift(...conversation.messages.slice(-5));
			}

			const response = await openai.chat.completions.create({
				model: 'gpt-4',
				messages,
				temperature: 0.7
			});

			const result = response.choices[0].message.content;

			if (conversationId) {
				await this.addMessage(conversationId, 'assistant', result);
			}

			return result;
		} catch (error) {
			throw new Error(`Error suggesting clauses: ${error.message}`);
		}
	}

	async adjustTone(text, targetTone, conversationId = null) {
		try {
			const messages = [
				{
					role: 'system',
					content: `You are a legal document assistant. Rewrite the following text in a ${targetTone} tone while maintaining its legal meaning.`
				},
				{
					role: 'user',
					content: text
				}
			];

			if (conversationId) {
				const conversation = await this.getConversation(conversationId);
				messages.unshift(...conversation.messages.slice(-5));
			}

			const response = await openai.chat.completions.create({
				model: 'gpt-4',
				messages,
				temperature: 0.7
			});

			const result = response.choices[0].message.content;

			if (conversationId) {
				await this.addMessage(conversationId, 'assistant', result);
			}

			return result;
		} catch (error) {
			throw new Error(`Error adjusting tone: ${error.message}`);
		}
	}
}

module.exports = new LexiAIService();

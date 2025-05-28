import lexiAIService from '../services/lexiAIService';

class LexiAIController {
	async createConversation(req, res) {
		try {
			const { title } = req.body;
			if (!title) {
				return res.status(400).json({ error: 'Title is required' });
			}
			const conversation = await lexiAIService.createConversation(req.user.id, title);
			res.json({ conversation });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async getConversation(req, res) {
		try {
			const { conversationId } = req.params;
			const conversation = await lexiAIService.getConversation(conversationId);
			if (conversation.userId.toString() !== req.user.id) {
				return res.status(403).json({ error: 'Unauthorized access to conversation' });
			}
			res.json({ conversation });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async getUserConversations(req, res) {
		try {
			const conversations = await lexiAIService.getUserConversations(req.user.id);
			res.json({ conversations });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async summarizeText(req, res) {
		try {
			const { text, conversationId } = req.body;
			if (!text) {
				return res.status(400).json({ error: 'Text is required' });
			}
			const summary = await lexiAIService.summarizeText(text, conversationId);
			res.json({ summary });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async explainLegalJargon(req, res) {
		try {
			const { text, conversationId } = req.body;
			if (!text) {
				return res.status(400).json({ error: 'Text is required' });
			}
			const explanation = await lexiAIService.explainLegalJargon(text, conversationId);
			res.json({ explanation });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async analyzeRisks(req, res) {
		try {
			const { text, conversationId } = req.body;
			if (!text) {
				return res.status(400).json({ error: 'Text is required' });
			}
			const analysis = await lexiAIService.analyzeRisks(text, conversationId);
			res.json({ analysis });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async suggestClauses(req, res) {
		try {
			const { context, type, conversationId } = req.body;
			if (!context || !type) {
				return res.status(400).json({ error: 'Context and type are required' });
			}
			const suggestions = await lexiAIService.suggestClauses(context, type, conversationId);
			res.json({ suggestions });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}

	async adjustTone(req, res) {
		try {
			const { text, targetTone, conversationId } = req.body;
			if (!text || !targetTone) {
				return res.status(400).json({ error: 'Text and target tone are required' });
			}
			const adjustedText = await lexiAIService.adjustTone(text, targetTone, conversationId);
			res.json({ adjustedText });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	}
}

module.exports = new LexiAIController();

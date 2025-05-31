import { OpenAI } from 'openai';
import config from '~/config/config';

const openai = new OpenAI({
	apiKey: config.openai.apiKey
});

export async function generateContractSections(contractType, parties) {
	const prompt = `Generate a comprehensive ${contractType} contract with the following parties:
		${parties.map((p) => `${p.name} (${p.role})`).join(', ')}
		
		Please provide the contract in sections with titles and content.`;

	const response = await openai.chat.completions.create({
		model: 'gpt-4',
		messages: [
			{
				role: 'system',
				content: 'You are a legal document assistant. Generate contract sections based on the type and parties provided.'
			},
			{
				role: 'user',
				content: prompt
			}
		],
		temperature: 0.7
	});

	return parseContractSections(response.choices[0].message.content);
}

export async function rewriteSection(sectionContent, style) {
	const prompt = `Rewrite the following contract section in a ${style} style while maintaining its legal meaning:
		${sectionContent}`;

	const response = await openai.chat.completions.create({
		model: 'gpt-4',
		messages: [
			{
				role: 'system',
				content: 'You are a legal document assistant. Rewrite the provided section in the requested style.'
			},
			{
				role: 'user',
				content: prompt
			}
		],
		temperature: 0.7
	});

	return response.choices[0].message.content;
}

export async function suggestClause(context, type) {
	const prompt = `Suggest an appropriate ${type} clause for the following context:
		${context}`;

	const response = await openai.chat.completions.create({
		model: 'gpt-4',
		messages: [
			{
				role: 'system',
				content: 'You are a legal document assistant. Suggest appropriate clauses based on the context.'
			},
			{
				role: 'user',
				content: prompt
			}
		],
		temperature: 0.7
	});

	return response.choices[0].message.content;
}

function parseContractSections(content) {
	// Split content into sections based on headers
	const sections = content.split(/\n(?=#|\d\.|\w+\.)/).filter(Boolean);
	return sections.map((section, index) => {
		const [title, ...contentLines] = section.split('\n');
		return {
			title: title.replace(/^[#\d.\s]+/, '').trim(),
			content: contentLines.join('\n').trim(),
			order: index + 1
		};
	});
}

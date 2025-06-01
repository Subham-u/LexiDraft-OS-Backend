import contractService from '~/services/contractService';
import catchAsync from '~/utils/catchAsync';
import httpStatus from 'http-status';
import { OpenAI } from 'openai';
// import Contract from '~/models/contract';
import config from '~/config/config';

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: config.openai.apiKey
});

class ContractController {
	async createContract(req, res) {
		try {
			const contract = await contractService.createContract(req.body, req.user.id);
			res.status(201).json(contract);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	async getContract(req, res) {
		try {
			const contract = await contractService.getContract(req.params.contractId);
			res.json(contract);
		} catch (error) {
			res.status(404).json({ error: error.message });
		}
	}

	async getUserContracts(req, res) {
		try {
			const result = await contractService.getUserContracts(req.user.id, req.query);
			res.json(result);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	async updateContract(req, res) {
		try {
			const contract = await contractService.updateContract(req.params.contractId, req.body, req.user.id);
			res.json(contract);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	async deleteContract(req, res) {
		try {
			const result = await contractService.deleteContract(req.params.contractId, req.user.id);
			res.json(result);
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	async generateContractSections(req, res) {
		try {
			const { contractType, parties } = req.body;
			const sections = await contractService.generateContractSections(contractType, parties);
			res.json({ sections });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	async rewriteSection(req, res) {
		try {
			const { sectionContent, style } = req.body;
			const rewrittenContent = await contractService.rewriteSection(sectionContent, style);
			res.json({ content: rewrittenContent });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	async suggestClause(req, res) {
		try {
			const { context, type } = req.body;
			const clause = await contractService.suggestClause(context, type);
			res.json({ clause });
		} catch (error) {
			res.status(400).json({ error: error.message });
		}
	}

	generateAIContract = catchAsync(async (req, res) => {
		const { title, type, description, parties, jurisdiction, startDate, endDate, content, aiPreferences } = req.body;

		// Parse the JSON stringified parties and content
		const parsedParties = JSON.parse(parties);
		const parsedContent = JSON.parse(content);

		// Generate contract content using AI
		const contractContent = await this.generateContractContent({
			title,
			type,
			description,
			parties: parsedParties,
			jurisdiction,
			startDate,
			endDate,
			content: parsedContent,
			aiPreferences
		});

		// Create the contract with AI-generated content
		const contract = await contractService.createContract(
			{
				title,
				type,
				description,
				parties: parsedParties,
				jurisdiction,
				startDate,
				endDate,
				content: JSON.stringify(contractContent)
			},
			req.user.id
		);

		res.status(httpStatus.CREATED).send(contract);
	});

	// Helper function to generate contract content using AI
	async generateContractContent({ title, type, description, parties, jurisdiction, startDate, endDate, content, aiPreferences }) {
		// Prepare the prompt for the AI
		const prompt = `Generate a legal contract with the following details:
Title: ${title}
Type: ${type}
Description: ${description}
Parties: ${JSON.stringify(parties)}
Jurisdiction: ${jurisdiction}
Start Date: ${startDate}
End Date: ${endDate}
Tone: ${aiPreferences.tone}
Language: ${aiPreferences.language}

Preferred Content Structure:
${JSON.stringify(content, null, 2)}

Required sections:
${aiPreferences.includeDefinitions ? '- Definitions: Clearly define all key terms used in the contract\n' : ''}
${aiPreferences.includeJurisdiction ? '- Jurisdiction: Specify the governing law and jurisdiction for disputes\n' : ''}
${aiPreferences.includeDisputeResolution ? '- Dispute Resolution: Include arbitration or mediation clauses as appropriate\n' : ''}
- Parties: Detailed information about all parties involved
- Term: Contract duration and renewal terms
- Obligations: Specific duties and responsibilities of each party
- Payment Terms: If applicable, include payment schedules and methods
- Confidentiality: If applicable, include confidentiality clauses
- Termination: Conditions and procedures for contract termination
- Miscellaneous: Include standard boilerplate clauses

Please generate a complete, legally sound contract that follows this structure and includes all necessary clauses and sections.`;

		// Call OpenAI API to generate the contract content
		const response = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: [
				{
					role: 'system',
					content:
						'You are a legal contract expert. Generate a complete, legally sound contract based on the provided details. Ensure the contract is well-structured, clear, and enforceable.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.7,
			max_tokens: 4000
		});

		// Parse the AI response and structure it
		const aiResponse = response.choices[0].message.content;
		const clauses = this.parseContractClauses(aiResponse);

		return {
			clauses,
			appearance: content.appearance || {
				font: 'Arial',
				spacing: 1.5,
				margins: {
					top: 72,
					bottom: 72,
					left: 72,
					right: 72
				}
			},
			aiResponses: [
				{
					query: prompt,
					response: aiResponse,
					timestamp: new Date().toISOString()
				}
			],
			conversationSummary: content.conversationSummary || `Contract generated for ${title} with ${parties.length} parties`
		};
	}

	// Helper function to parse contract clauses from AI response
	parseContractClauses(aiResponse) {
		// Split the response into sections based on headers
		const sections = aiResponse.split(/\n(?=[A-Z][A-Za-z\s]+:)/);
		
		return sections.map((section, index) => {
			const [title, ...contentParts] = section.split('\n');
			return {
				title: title.replace(':', '').trim(),
				content: contentParts.join('\n').trim(),
				order: index + 1  // Automatically assign order based on array index
			};
		});
	}
}

export default new ContractController();

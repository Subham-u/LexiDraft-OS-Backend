import { OpenAI } from 'openai';
import config from '~/config/config';
import logger from '~/config/logger';

class ContractAnalysisService {
	constructor() {
		this.openai = new OpenAI({
			apiKey: config.openai.apiKey
		});
	}

	async analyzeContract(contract, options = {}) {
		const { analysisType = 'all', jurisdiction, industry, additionalContext } = options;

		try {
			// Prepare the contract content for analysis
			const contractContent = this.prepareContractContent(contract);

			// Generate analysis prompt based on type
			const prompt = this.generateAnalysisPrompt(contractContent, {
				analysisType,
				jurisdiction,
				industry,
				additionalContext
			});

			// Get AI analysis
			const analysis = await this.getAIAnalysis(prompt);

			// Structure the response
			return this.structureAnalysisResponse(analysis, analysisType);
		} catch (error) {
			logger.error('Contract analysis failed:', error);
			throw new Error('Failed to analyze contract');
		}
	}

	prepareContractContent(contract) {
		const content = JSON.parse(contract.content);
		return {
			title: contract.title,
			type: contract.type,
			description: contract.description,
			parties: contract.parties,
			jurisdiction: contract.jurisdiction,
			startDate: contract.startDate,
			endDate: contract.endDate,
			clauses: content.clauses
		};
	}

	generateAnalysisPrompt(contractContent, options) {
		const { analysisType, jurisdiction, industry, additionalContext } = options;

		let analysisInstructions = '';
		switch (analysisType) {
			case 'risk':
				analysisInstructions = `
				1. Identify potential legal and business risks
				2. Assess risk severity (High/Medium/Low)
				3. Suggest risk mitigation strategies
				4. Highlight ambiguous or unclear terms`;
				break;
			case 'compliance':
				analysisInstructions = `
				1. Check compliance with relevant laws and regulations
				2. Identify missing required clauses
				3. Flag potential compliance issues
				4. Suggest compliance improvements`;
				break;
			case 'terms':
				analysisInstructions = `
				1. Extract and summarize key terms
				2. Identify unusual or onerous terms
				3. Compare terms with industry standards
				4. Highlight important deadlines and obligations`;
				break;
			default:
				analysisInstructions = `
				1. Comprehensive risk assessment
				2. Compliance analysis
				3. Key terms analysis
				4. Industry-specific considerations
				5. Recommendations for improvement`;
		}

		return `Analyze the following contract and provide a detailed analysis:

Contract Details:
Title: ${contractContent.title}
Type: ${contractContent.type}
Description: ${contractContent.description}
Jurisdiction: ${jurisdiction || contractContent.jurisdiction}
Industry: ${industry || 'Not specified'}

Parties:
${JSON.stringify(contractContent.parties, null, 2)}

Contract Clauses:
${JSON.stringify(contractContent.clauses, null, 2)}

Additional Context:
${additionalContext || 'None provided'}

Please provide a detailed analysis covering:
${analysisInstructions}

Format the response as a structured JSON object with the following sections:
{
  "summary": "Brief overview of the analysis",
  "findings": {
    "risks": [],
    "compliance": [],
    "terms": []
  },
  "recommendations": [],
  "severity": "Overall risk level (High/Medium/Low)",
  "confidence": "Analysis confidence level (High/Medium/Low)"
}`;
	}

	async getAIAnalysis(prompt) {
		const response = await this.openai.chat.completions.create({
			model: 'gpt-4',
			messages: [
				{
					role: 'system',
					content: 'You are an expert contract analyst with deep knowledge of legal compliance, risk assessment, and contract law. Provide detailed, accurate, and actionable analysis.'
				},
				{
					role: 'user',
					content: prompt
				}
			],
			temperature: 0.3,
			max_tokens: 4000
		});

		try {
			return JSON.parse(response.choices[0].message.content);
		} catch (error) {
			logger.error('Failed to parse AI response:', error);
			throw new Error('Failed to parse analysis results');
		}
	}

	structureAnalysisResponse(analysis, analysisType) {
		// Filter sections based on analysis type
		const filteredAnalysis = {
			summary: analysis.summary,
			severity: analysis.severity,
			confidence: analysis.confidence,
			recommendations: analysis.recommendations
		};

		if (analysisType === 'all' || analysisType === 'risk') {
			filteredAnalysis.risks = analysis.findings.risks;
		}
		if (analysisType === 'all' || analysisType === 'compliance') {
			filteredAnalysis.compliance = analysis.findings.compliance;
		}
		if (analysisType === 'all' || analysisType === 'terms') {
			filteredAnalysis.terms = analysis.findings.terms;
		}

		return filteredAnalysis;
	}
}

export default new ContractAnalysisService(); 
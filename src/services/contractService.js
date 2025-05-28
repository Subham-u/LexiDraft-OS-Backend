import Contract from '~/models/contract';
import { generateContractSections, rewriteSection, suggestClause } from '~/services/aiService';

class ContractService {
	async createContract(contractData, userId) {
		const contract = new Contract({
			...contractData,
			userId
		});
		await contract.save();
		return contract;
	}

	async getContract(contractId) {
		const contract = await Contract.findById(contractId);
		if (!contract) {
			throw new Error('Contract not found');
		}
		return contract;
	}

	async getUserContracts(userId, query) {
		const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;
		const skip = (page - 1) * limit;

		const contracts = await Contract.find({ userId })
			.sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
			.skip(skip)
			.limit(limit);

		const total = await Contract.countDocuments({ userId });

		return {
			contracts,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				pages: Math.ceil(total / limit)
			}
		};
	}

	async updateContract(contractId, updateData, userId) {
		const contract = await Contract.findOne({ _id: contractId, userId });
		if (!contract) {
			throw new Error('Contract not found');
		}

		Object.assign(contract, updateData);
		await contract.save();
		return contract;
	}

	async deleteContract(contractId, userId) {
		const contract = await Contract.findOneAndDelete({ _id: contractId, userId });
		if (!contract) {
			throw new Error('Contract not found');
		}
		return { message: 'Contract deleted successfully' };
	}

	async generateContractSections(contractType, parties) {
		return await generateContractSections(contractType, parties);
	}

	async rewriteSection(sectionContent, style) {
		return await rewriteSection(sectionContent, style);
	}

	async suggestClause(context, type) {
		return await suggestClause(context, type);
	}
}

export default new ContractService();

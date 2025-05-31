import contractService from '~/services/contractService';

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
}

export default new ContractController();

import Clause from '~/models/Clause';

class ClauseService {
	async searchClauses(query, filters = {}) {
		const searchQuery = {
			$or: [
				{ title: { $regex: query, $options: 'i' } },
				{ content: { $regex: query, $options: 'i' } },
				{ keywords: { $in: [new RegExp(query, 'i')] } }
			],
			...filters
		};

		return await Clause.find(searchQuery).sort({ isMustHave: -1, createdAt: -1 }).limit(5);
	}

	async getClausesByCategory(category, filters = {}) {
		return await Clause.find({ category, ...filters }).sort({ isMustHave: -1, createdAt: -1 });
	}

	async getMustHaveClauses(contractType) {
		return await Clause.find({
			isMustHave: true,
			contractTypes: contractType
		}).sort({ category: 1 });
	}

	async createClause(clauseData) {
		const clause = new Clause(clauseData);
		return await clause.save();
	}

	async updateClause(id, updateData) {
		return await Clause.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
	}

	async deleteClause(id) {
		return await Clause.findByIdAndDelete(id);
	}

	async getClauseById(id) {
		return await Clause.findById(id);
	}

	async addToPersonalLibrary(userId, clauseId) {
		// Implementation for adding clause to user's personal library
		// This would typically involve another model for user's saved clauses
		throw new Error('Not implemented');
	}

	async rewriteClause(clauseId, newTone) {
		const clause = await this.getClauseById(clauseId);
		if (!clause) {
			throw new Error('Clause not found');
		}

		// Here you would typically integrate with an AI service to rewrite the clause
		// For now, we'll just return the original clause
		return clause;
	}
}

export default new ClauseService();

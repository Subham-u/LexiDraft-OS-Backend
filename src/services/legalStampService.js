import LegalStamp from '~/models/LegalStamp';
import { generateStampCoverPage } from '~/utils/stampGenerator';
import { attachStampToDocument } from '~/utils/documentProcessor';
import { initiateAadhaarSigning, verifyAadhaarOTP } from '~/services/aadhaarService';
import { verifyDSC } from '~/services/dscService';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';

class LegalStampService {
	async createStamp(stampData) {
		const stamp = new LegalStamp({
			...stampData,
			status: 'draft'
		});

		return await stamp.save();
	}

	async generateStamp(legalStampId) {
		const stamp = await LegalStamp.findById(legalStampId);
		if (!stamp) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Legal stamp not found');
		}

		// Generate stamp cover page
		const coverPage = await generateStampCoverPage({
			state: stamp.stamp.state,
			value: stamp.stamp.value,
			contractId: stamp.contract
		});

		// Update stamp details
		stamp.stamp.coverPage = coverPage;
		stamp.stamp.status = 'generated';
		stamp.stamp.generatedAt = new Date();
		stamp.status = 'stamped';

		return await stamp.save();
	}

	async attachStamp(legalStampId) {
		const stamp = await LegalStamp.findById(legalStampId);
		if (!stamp) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Legal stamp not found');
		}

		if (stamp.stamp.status !== 'generated') {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Stamp must be generated before attaching');
		}

		// Attach stamp to document
		const finalDocument = await attachStampToDocument({
			contractId: stamp.contract,
			coverPage: stamp.stamp.coverPage
		});

		stamp.stamp.status = 'attached';
		stamp.stamp.attachedAt = new Date();
		stamp.finalDocument = finalDocument;

		return await stamp.save();
	}

	async initiateAadhaarSigning(legalStampId, userId) {
		const stamp = await LegalStamp.findById(legalStampId);
		if (!stamp) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Legal stamp not found');
		}

		// Initiate Aadhaar signing process
		const { transactionId } = await initiateAadhaarSigning({
			documentUrl: stamp.finalDocument,
			userId
		});

		// Add signature record
		stamp.signatures.push({
			user: userId,
			type: 'Aadhaar',
			status: 'pending',
			aadhaarDetails: {
				transactionId,
				otpVerified: false
			}
		});

		return await stamp.save();
	}

	async verifyAadhaarOTP(legalStampId, userId, otp) {
		const stamp = await LegalStamp.findById(legalStampId);
		if (!stamp) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Legal stamp not found');
		}

		const signature = stamp.signatures.find((s) => s.user.toString() === userId && s.type === 'Aadhaar');
		if (!signature) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Aadhaar signature not found');
		}

		// Verify OTP
		const { signedDocument, signatureImage } = await verifyAadhaarOTP({
			transactionId: signature.aadhaarDetails.transactionId,
			otp
		});

		// Update signature details
		signature.status = 'completed';
		signature.aadhaarDetails.otpVerified = true;
		signature.aadhaarDetails.signedAt = new Date();
		signature.signatureImage = signatureImage;
		signature.signedAt = new Date();

		// Update final document
		stamp.finalDocument = signedDocument;
		stamp.status = 'signed';

		return await stamp.save();
	}

	async uploadDSC(legalStampId, userId, dscFile) {
		const stamp = await LegalStamp.findById(legalStampId);
		if (!stamp) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Legal stamp not found');
		}

		// Verify DSC
		const dscDetails = await verifyDSC(dscFile);

		// Add signature record
		stamp.signatures.push({
			user: userId,
			type: 'DSC',
			status: 'completed',
			dscDetails: {
				...dscDetails,
				uploadedAt: new Date()
			},
			signedAt: new Date()
		});

		// Update final document with DSC signature
		const signedDocument = await attachStampToDocument({
			contractId: stamp.contract,
			coverPage: stamp.stamp.coverPage,
			dscFile
		});

		stamp.finalDocument = signedDocument;
		stamp.status = 'signed';

		return await stamp.save();
	}

	async verifyStamp(legalStampId, verifierId, remarks) {
		const stamp = await LegalStamp.findById(legalStampId);
		if (!stamp) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Legal stamp not found');
		}

		stamp.verificationDetails = {
			verifiedAt: new Date(),
			verifiedBy: verifierId,
			verificationStatus: 'verified',
			remarks
		};

		stamp.status = 'completed';

		return await stamp.save();
	}

	async getStampById(legalStampId) {
		const stamp = await LegalStamp.findById(legalStampId)
			.populate('contract')
			.populate('owner', 'name email')
			.populate('signatures.user', 'name email')
			.populate('verificationDetails.verifiedBy', 'name email');

		if (!stamp) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Legal stamp not found');
		}

		return stamp;
	}

	async getStampsByOwner(ownerId, filters = {}) {
		return await LegalStamp.find({ owner: ownerId, ...filters })
			.sort({ createdAt: -1 })
			.populate('contract')
			.populate('signatures.user', 'name email');
	}

	async updateStamp(legalStampId, updateData) {
		return await LegalStamp.findByIdAndUpdate(legalStampId, { $set: updateData }, { new: true, runValidators: true });
	}

	async deleteStamp(legalStampId) {
		return await LegalStamp.findByIdAndDelete(legalStampId);
	}
}

export default new LegalStampService();

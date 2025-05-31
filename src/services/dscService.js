import forge from 'node-forge';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';

/**
 * Verify a Digital Signature Certificate
 * @param {Buffer} dscFile - DSC file buffer
 * @returns {Promise<Object>} DSC details
 */
export const verifyDSC = async (dscFile) => {
	try {
		// Convert buffer to ASN.1 format
		const asn1 = forge.asn1.fromDer(dscFile.toString('binary'));
		const certificate = forge.pki.certificateFromAsn1(asn1);

		// Extract certificate details
		const details = {
			serialNumber: certificate.serialNumber,
			validFrom: certificate.validity.notBefore,
			validTo: certificate.validity.notAfter,
			issuer: certificate.issuer.attributes.map((attr) => `${attr.name}=${attr.value}`).join(', '),
			subject: certificate.subject.attributes.map((attr) => `${attr.name}=${attr.value}`).join(', '),
			publicKey: certificate.publicKey.n.toString(16)
		};

		// Verify certificate validity
		const now = new Date();
		if (now < details.validFrom || now > details.validTo) {
			throw new Error('Certificate is not valid at this time');
		}

		// Verify certificate chain (in a real implementation, you would verify against trusted CAs)
		// This is a placeholder for the actual implementation
		// await verifyCertificateChain(certificate);

		return details;
	} catch (error) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid or expired DSC: ' + error.message);
	}
};

/**
 * Sign a document using DSC
 * @param {Buffer} document - Document to be signed
 * @param {Buffer} dscFile - DSC file buffer
 * @param {string} password - DSC password
 * @returns {Promise<Object>} Signed document details
 */
export const signDocument = async (document, dscFile, password) => {
	try {
		// Convert buffer to ASN.1 format
		const asn1 = forge.asn1.fromDer(dscFile.toString('binary'));
		const certificate = forge.pki.certificateFromAsn1(asn1);

		// Create signature
		const md = forge.md.sha256.create();
		md.update(document.toString('binary'));
		const signature = certificate.privateKey.sign(md);

		// Create signed document
		const signedDocument = {
			document,
			signature: signature.toHex(),
			certificate: {
				serialNumber: certificate.serialNumber,
				validFrom: certificate.validity.notBefore,
				validTo: certificate.validity.notAfter,
				issuer: certificate.issuer.attributes.map((attr) => `${attr.name}=${attr.value}`).join(', '),
				subject: certificate.subject.attributes.map((attr) => `${attr.name}=${attr.value}`).join(', ')
			}
		};

		return signedDocument;
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error signing document: ' + error.message);
	}
};

/**
 * Verify a signed document
 * @param {Object} signedDocument - Signed document object
 * @returns {Promise<boolean>} Verification result
 */
export const verifySignedDocument = async (signedDocument) => {
	try {
		const { document, signature, certificate } = signedDocument;

		// Verify signature
		const md = forge.md.sha256.create();
		md.update(document.toString('binary'));
		const isValid = certificate.publicKey.verify(md.digest().bytes(), forge.util.hexToBytes(signature));

		// Verify certificate validity
		const now = new Date();
		const isCertificateValid = now >= certificate.validFrom && now <= certificate.validTo;

		return isValid && isCertificateValid;
	} catch (error) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Error verifying signed document: ' + error.message);
	}
};

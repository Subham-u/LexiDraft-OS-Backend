import multer from 'multer';
import { ApiError } from '~/utils/apiError';
import httpStatus from 'http-status';

// Configure storage
const storage = multer.memoryStorage();

// File filter for DSC files
const fileFilter = (req, file, cb) => {
	// Accept only .cer, .p12, .pfx files
	if (
		file.mimetype === 'application/x-x509-ca-cert' ||
		file.mimetype === 'application/x-pkcs12' ||
		file.originalname.endsWith('.cer') ||
		file.originalname.endsWith('.p12') ||
		file.originalname.endsWith('.pfx')
	) {
		cb(null, true);
	} else {
		cb(new ApiError(httpStatus.BAD_REQUEST, 'Invalid file type. Only .cer, .p12, and .pfx files are allowed'), false);
	}
};

// Configure multer
const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024 // 5MB limit
	}
});

// Export the multer instance
export const uploadDSC = upload;

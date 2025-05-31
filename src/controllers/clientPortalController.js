import httpStatus from 'http-status';
import { ClientPortal } from '~/models';
import ApiError from '~/utils/apiError';
// import { generateToken } from '~/utils/token';

const createPortal = async (req, res) => {
	const { title, description, documentId, participants } = req.body;
	const portal = await ClientPortal.create({
		title,
		description,
		documentId,
		participants,
		owner: req.user.id,
		status: 'active'
	});
	res.status(httpStatus.CREATED).send(portal);
};

const getPortalsByOwner = async (req, res) => {
	const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
	const portals = await ClientPortal.find({ owner: req.user.id })
		.sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
		.skip((page - 1) * limit)
		.limit(limit);
	const total = await ClientPortal.countDocuments({ owner: req.user.id });
	res.send({ results: portals, total, page: Number(page), limit: Number(limit) });
};

const updatePortal = async (req, res) => {
	const { portalId } = req.params;
	const portal = await ClientPortal.findOne({ _id: portalId, owner: req.user.id });
	if (!portal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Portal not found');
	}
	Object.assign(portal, req.body);
	await portal.save();
	res.send(portal);
};

const deletePortal = async (req, res) => {
	const { portalId } = req.params;
	const portal = await ClientPortal.findOne({ _id: portalId, owner: req.user.id });
	if (!portal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Portal not found');
	}
	await portal.remove();
	res.status(httpStatus.NO_CONTENT).send();
};

const updatePortalStatus = async (req, res) => {
	const { portalId } = req.params;
	const { status } = req.body;
	const portal = await ClientPortal.findOne({ _id: portalId, owner: req.user.id });
	if (!portal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Portal not found');
	}
	portal.status = status;
	await portal.save();
	res.send(portal);
};

const addComment = async (req, res) => {
	const { portalId } = req.params;
	const { content } = req.body;
	const portal = await ClientPortal.findOne({ _id: portalId, owner: req.user.id });
	if (!portal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Portal not found');
	}
	portal.comments.push({
		content,
		user: req.user.id,
		timestamp: new Date()
	});
	await portal.save();
	res.send(portal);
};

const addSignature = async (req, res) => {
	const { portalId } = req.params;
	const { signatureData, position } = req.body;
	const portal = await ClientPortal.findOne({ _id: portalId, owner: req.user.id });
	if (!portal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Portal not found');
	}
	portal.signatures.push({
		signatureData,
		position,
		user: req.user.id,
		timestamp: new Date()
	});
	await portal.save();
	res.send(portal);
};

const sendReminder = async (req, res) => {
	const { portalId } = req.params;
	const { participantEmail, message } = req.body;
	const portal = await ClientPortal.findOne({ _id: portalId, owner: req.user.id });
	if (!portal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Portal not found');
	}
	const participant = portal.participants.find((p) => p.email === participantEmail);
	if (!participant) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Participant not found');
	}
	// TODO: Implement email sending logic here
	res.status(httpStatus.OK).send({ message: 'Reminder sent successfully' });
};

const getTimeline = async (req, res) => {
	const { portalId } = req.params;
	const portal = await ClientPortal.findOne({ _id: portalId, owner: req.user.id });
	if (!portal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Portal not found');
	}
	const timeline = [
		...portal.comments.map((comment) => ({
			type: 'comment',
			content: comment.content,
			user: comment.user,
			timestamp: comment.timestamp
		})),
		...portal.signatures.map((signature) => ({
			type: 'signature',
			user: signature.user,
			timestamp: signature.timestamp
		}))
	].sort((a, b) => b.timestamp - a.timestamp);
	res.send(timeline);
};

const getPortalByToken = async (req, res) => {
	const { token } = req.params;
	const portal = await ClientPortal.findOne({ token });
	if (!portal) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Portal not found');
	}
	res.send(portal);
};

export default {
	createPortal,
	getPortalsByOwner,
	updatePortal,
	deletePortal,
	updatePortalStatus,
	addComment,
	addSignature,
	sendReminder,
	getTimeline,
	getPortalByToken
};

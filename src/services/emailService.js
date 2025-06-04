import nodemailer from 'nodemailer';
import config from '~/config/config';
import logger from '~/config/logger';
import { User } from '~/models';

class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: config.email.smtp.host,
			port: config.email.smtp.port,
			secure: config.email.smtp.secure,
			auth: {
				user: config.email.smtp.auth.user,
				pass: config.email.smtp.auth.pass
			},
			tls: {
				// Do not fail on invalid certs
				rejectUnauthorized: false
			},
			// Connection timeout
			connectionTimeout: 10000,
			// Socket timeout
			socketTimeout: 10000
		});

		// Verify connection configuration
		this.verifyConnection();
	}

	async verifyConnection() {
		try {
			await this.transporter.verify();
			logger.info('SMTP connection verified successfully');
		} catch (error) {
			logger.error('SMTP connection verification failed:', error);
		}
	}

	async sendEmail(to, subject, html) {
		const mailOptions = {
			from: config.email.from,
			to,
			subject,
			html
		};

		try {
			// Retry logic for sending emails
			let retries = 3;
			while (retries > 0) {
				try {
					const info = await this.transporter.sendMail(mailOptions);
					logger.info(`Email sent successfully to ${to}`, info.messageId);
					return info;
				} catch (error) {
					retries--;
					if (retries === 0) throw error;
					logger.warn(`Failed to send email, retrying... (${3 - retries}/3)`);
					// Wait for 1 second before retrying
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
			}
		} catch (error) {
			logger.error('Error sending email:', error);
			// Don't throw error to prevent breaking the main flow
			return null;
		}
	}

	async sendContractAccessNotification(sharedContract, accessedByEmail) {
		const subject = 'Contract Access Notification';
		const html = `
			<h2>Contract Access Notification</h2>
			<p>Your shared contract has been accessed by: ${accessedByEmail}</p>
			<p>Details:</p>
			<ul>
				<li>Access Time: ${new Date().toLocaleString()}</li>
				<li>Access Type: ${sharedContract.accessType}</li>
				<li>Total Accesses: ${sharedContract.accessCount}</li>
			</ul>
			<p>If this access was unauthorized, please contact support immediately.</p>
		`;

		try {
			// Get contract creator's email
			const contract = await sharedContract.populate('contractId');
			const creator = await User.findById(contract.contractId.userId);

			if (!creator?.email) {
				logger.error('Contract creator email not found');
				return null;
			}

			return await this.sendEmail(creator.email, subject, html);
		} catch (error) {
			logger.error('Failed to send contract access notification:', error);
			return null;
		}
	}

	async sendContractShareNotification(sharedContract, recipientEmail) {
		const subject = 'Contract Share Notification';
		const html = `
			<h2>Contract Share Notification</h2>
			<p>You have been granted access to a contract.</p>
			<p>Details:</p>
			<ul>
				<li>Access Type: ${sharedContract.accessType}</li>
				<li>Expires: ${new Date(sharedContract.expiresAt).toLocaleString()}</li>
			</ul>
			<p>Click the link below to access the contract:</p>
			<a href="${config.clientUrl}/contracts/shared/${sharedContract.shareToken}">Access Contract</a>
		`;

		try {
			return await this.sendEmail(recipientEmail, subject, html);
		} catch (error) {
			logger.error('Failed to send contract share notification:', error);
			return null;
		}
	}

	async sendAccessRequestNotification(creatorEmail, { contractTitle, requestedBy, reason, shareToken }) {
		const subject = 'New Contract Access Request';
		const html = `
			<h2>New Contract Access Request</h2>
			<p>Someone has requested access to your contract: ${contractTitle}</p>
			<p>Details:</p>
			<ul>
				<li>Requested By: ${requestedBy}</li>
				<li>Reason: ${reason || 'No reason provided'}</li>
				<li>Requested At: ${new Date().toLocaleString()}</li>
			</ul>
			<p>Click the link below to review and respond to this request:</p>
			<a href="${config.clientUrl}/contracts/shared/${shareToken}/requests">Review Request</a>
		`;

		return await this.sendEmail(creatorEmail, subject, html);
	}

	async sendAccessRequestResponseNotification(requesterEmail, { status, responseNote, shareToken }) {
		const subject = `Contract Access Request ${status === 'approved' ? 'Approved' : 'Rejected'}`;
		const html = `
			<h2>Contract Access Request ${status === 'approved' ? 'Approved' : 'Rejected'}</h2>
			<p>Your request for contract access has been ${status}.</p>
			${responseNote ? `<p>Response Note: ${responseNote}</p>` : ''}
			${
				status === 'approved'
					? `
				<p>You can now access the contract using the link below:</p>
				<a href="${config.clientUrl}/contracts/shared/${shareToken}">Access Contract</a>
			`
					: ''
			}
		`;

		return await this.sendEmail(requesterEmail, subject, html);
	}
}

export default new EmailService();

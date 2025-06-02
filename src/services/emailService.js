import nodemailer from 'nodemailer';
import config from '~/config/config';
import logger from '~/config/logger';

class EmailService {
	constructor() {
		this.transporter = nodemailer.createTransport({
			host: config.email.smtp.host,
			port: config.email.smtp.port,
			secure: config.email.smtp.secure,
			auth: {
				user: config.email.smtp.auth.user,
				pass: config.email.smtp.auth.pass
			}
		});
	}

	async sendEmail(to, subject, html) {
		const mailOptions = {
			from: config.email.from,
			to,
			subject,
			html
		};

		try {
			await this.transporter.sendMail(mailOptions);
			logger.info(`Email sent successfully to ${to}`);
		} catch (error) {
			logger.error('Error sending email:', error);
			throw new Error('Failed to send email');
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

		// Get contract creator's email
		const contract = await sharedContract.populate('contractId');
		const creator = await contract.contractId.populate('userId');

		await this.sendEmail(creator.userId.email, subject, html);
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

		await this.sendEmail(recipientEmail, subject, html);
	}
}

export default new EmailService();

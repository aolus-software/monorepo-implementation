import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";

export interface MailerConfig {
	host: string;
	port: number;
	secure: boolean;
	auth: {
		user: string;
		pass: string;
	};
	from: string;
}

export interface EmailOptions {
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	attachments?: {
		filename: string;
		content?: string | Buffer;
		path?: string;
	}[];
	cc?: string | string[];
	bcc?: string | string[];
	replyTo?: string;
	from?: string; // Allow overriding the default from address
}

/**
 * Clean and reusable SMTP email service
 * This service only handles sending emails, not templates
 */
export class MailerService {
	private transporter: Transporter;
	private config: MailerConfig;

	constructor(config: MailerConfig) {
		this.config = config;
		this.transporter = nodemailer.createTransport({
			host: config.host,
			port: config.port,
			secure: config.secure,
			auth: {
				user: config.auth.user,
				pass: config.auth.pass,
			},
		});
	}

	/**
	 * Send an email via SMTP
	 * @param options - Email options including to, subject, html, text, etc.
	 */
	async sendMail(options: EmailOptions): Promise<void> {
		const mailOptions: SendMailOptions = {
			from: options.from ?? this.config.from,
			to: options.to,
			subject: options.subject,
			text: options.text,
			html: options.html,
			attachments: options.attachments,
			cc: options.cc,
			bcc: options.bcc,
			replyTo: options.replyTo,
		};

		await this.transporter.sendMail(mailOptions);
	}

	/**
	 * Verify SMTP connection configuration
	 * Useful for testing SMTP credentials before sending emails
	 */
	async verify(): Promise<boolean> {
		try {
			await this.transporter.verify();
			return true;
		} catch (error) {
			console.error("SMTP connection verification failed:", error);
			return false;
		}
	}

	/**
	 * Get the configured "from" address
	 */
	getFromAddress(): string {
		return this.config.from;
	}
}

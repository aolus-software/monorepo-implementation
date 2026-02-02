import { env } from "../env";
import { mailer } from "../mailer";

/**
 * Email templates and sending logic for the Admin API
 * All email content is defined here, not in the mailer package
 */
export const EmailService = {
	/**
	 * Send email verification link to user
	 */
	async sendVerificationEmail(
		to: string,
		token: string,
		userName: string,
	): Promise<void> {
		const verificationUrl = `${env.APP_NAME}/verify-email?token=${token}`;

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
						<h2 style="color: #333; margin-top: 0;">Email Verification</h2>
						<p>Hi ${userName},</p>
						<p>Thank you for registering! Please verify your email address by clicking the button below:</p>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${verificationUrl}" 
								 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
								Verify Email
							</a>
						</div>
						<p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
						<p style="color: #007bff; word-break: break-all; font-size: 14px;">${verificationUrl}</p>
						<p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't create an account, please ignore this email.</p>
					</div>
				</body>
			</html>
		`;

		const text = `
Hi ${userName},

Thank you for registering! Please verify your email address by visiting the link below:

${verificationUrl}

If you didn't create an account, please ignore this email.
		`;

		await mailer.sendMail({
			to,
			subject: "Verify Your Email Address",
			html,
			text,
		});
	},

	/**
	 * Send password reset link to user
	 */
	async sendPasswordResetEmail(
		to: string,
		token: string,
		userName: string,
	): Promise<void> {
		const resetUrl = `${env.APP_NAME}/reset-password?token=${token}`;

		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
						<h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
						<p>Hi ${userName},</p>
						<p>We received a request to reset your password. Click the button below to create a new password:</p>
						<div style="text-align: center; margin: 30px 0;">
							<a href="${resetUrl}" 
								 style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
								Reset Password
							</a>
						</div>
						<p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
						<p style="color: #dc3545; word-break: break-all; font-size: 14px;">${resetUrl}</p>
						<p style="color: #666; font-size: 12px; margin-top: 30px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
						<p style="color: #666; font-size: 12px;">This link will expire in 24 hours for security reasons.</p>
					</div>
				</body>
			</html>
		`;

		const text = `
Hi ${userName},

We received a request to reset your password. Visit the link below to create a new password:

${resetUrl}

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

This link will expire in 24 hours for security reasons.
		`;

		await mailer.sendMail({
			to,
			subject: "Reset Your Password",
			html,
			text,
		});
	},

	/**
	 * Send welcome email after successful verification
	 */
	async sendWelcomeEmail(to: string, userName: string): Promise<void> {
		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
						<h2 style="color: #333; margin-top: 0;">Welcome to Our Platform!</h2>
						<p>Hi ${userName},</p>
						<p>Thank you for verifying your email! Your account is now active and you can start using our platform.</p>
						<p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
						<p style="color: #666; font-size: 12px; margin-top: 30px;">Best regards,<br>The Team</p>
					</div>
				</body>
			</html>
		`;

		const text = `
Hi ${userName},

Thank you for verifying your email! Your account is now active and you can start using our platform.

If you have any questions or need assistance, feel free to reach out to our support team.

Best regards,
The Team
		`;

		await mailer.sendMail({
			to,
			subject: "Welcome!",
			html,
			text,
		});
	},

	/**
	 * Example: Send a custom notification email
	 * Add more email types as needed for your application
	 */
	async sendCustomNotification(
		to: string,
		subject: string,
		message: string,
	): Promise<void> {
		const html = `
			<!DOCTYPE html>
			<html>
				<head>
					<meta charset="utf-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
				</head>
				<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
					<div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
						<h2 style="color: #333; margin-top: 0;">${subject}</h2>
						<p>${message}</p>
					</div>
				</body>
			</html>
		`;

		await mailer.sendMail({
			to,
			subject,
			html,
			text: message,
		});
	},
};

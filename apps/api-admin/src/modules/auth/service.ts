import {
	UserRepository,
	users,
	emailVerifications,
	passwordResetTokens,
	eq,
	DbTransaction,
} from "@repo/database";
import { BadRequestError, log } from "@repo/elysia";
import { UserInformation } from "@repo/types";
import { HashUtils, TokenUtils } from "@repo/utils";
import { db } from "../../db";
import { EmailService } from "../../services/email.service";

/**
 * Helper function to send verification email
 */
const sendVerificationEmail = async (
	userId: string,
	userEmail: string,
	userName: string,
	tx?: DbTransaction,
): Promise<void> => {
	const dbInstance = tx ?? db;
	const token = TokenUtils.generateToken(32);
	const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	// Save token to database
	await dbInstance.insert(emailVerifications).values({
		user_id: userId,
		token,
		expired_at: expiredAt,
	});

	// Send email using EmailService
	await EmailService.sendVerificationEmail(userEmail, token, userName);

	log.info({ userId, email: userEmail }, "Verification email sent");
};

/**
 * Helper function to send password reset email
 */
const sendResetPasswordEmail = async (
	userId: string,
	userEmail: string,
	userName: string,
): Promise<void> => {
	const token = TokenUtils.generateToken(32);
	const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

	// Delete existing tokens for this user
	await db
		.delete(passwordResetTokens)
		.where(eq(passwordResetTokens.user_id, userId));

	// Save new token to database
	await db.insert(passwordResetTokens).values({
		user_id: userId,
		token,
		expired_at: expiredAt,
	});

	// Send email using EmailService
	await EmailService.sendPasswordResetEmail(userEmail, token, userName);

	log.info({ userId, email: userEmail }, "Password reset email sent");
};

export const AuthService = {
	singIn: async (email: string, password: string): Promise<UserInformation> => {
		try {
			const user = await UserRepository(db).findByEmail(email);

			if (!user) {
				throw new BadRequestError("Validation error", [
					{
						field: "email",
						message: "Invalid email or password",
					},
				]);
			}

			if (user.email_verified_at === null) {
				throw new BadRequestError("Validation error", [
					{
						field: "email",
						message: "Email not verified. Please check your inbox.",
					},
				]);
			}

			if (user.status !== "active") {
				throw new BadRequestError("Validation error", [
					{
						field: "email",
						message: "Your account is inactive. Please contact support.",
					},
				]);
			}

			const isPasswordValid = await HashUtils.compareHash(
				password,
				user.password,
			);

			if (!isPasswordValid) {
				throw new BadRequestError("Validation error", [
					{
						field: "email",
						message: "Invalid email or password",
					},
				]);
			}

			// Log successful login
			log.info(
				{ userId: user.id, email: user.email },
				"User logged in successfully",
			);

			return await UserRepository(db).UserInformation(user.id);
		} catch (error) {
			if (error instanceof BadRequestError) {
				throw error;
			}
			log.error({ error, email }, "Login error");
			throw new BadRequestError("Validation error", [
				{
					field: "email",
					message: "An error occurred during login",
				},
			]);
		}
	},

	register: async (data: {
		name: string;
		email: string;
		password: string;
	}): Promise<void> => {
		try {
			const existingUser = await UserRepository(db)
				.findByEmail(data.email)
				.catch(() => null);

			if (existingUser) {
				throw new BadRequestError("Validation error", [
					{
						field: "email",
						message: "Email is already registered",
					},
				]);
			}

			const hashedPassword = await HashUtils.generateHash(data.password);

			await db.transaction(async (tx: DbTransaction) => {
				const newUser = await UserRepository(tx).create(
					{
						name: data.name,
						email: data.email,
						password: hashedPassword,
					},
					tx,
				);

				// Send verification email
				await sendVerificationEmail(newUser.id, newUser.email, newUser.name, tx);
			});
		} catch (error) {
			if (error instanceof BadRequestError) {
				throw error;
			}
			log.error({ error, email: data.email }, "Registration error");
			throw new BadRequestError("Validation error", [
				{
					field: "general",
					message: "An error occurred during registration",
				},
			]);
		}
	},

	async resentVerificationEmail(email: string): Promise<void> {
		try {
			const user = await UserRepository(db)
				.findByEmail(email)
				.catch(() => null);

			if (!user) {
				return;
			}

			if (user.email_verified_at) {
				log.info(
					{ userId: user.id, email },
					"Verification email requested for already verified user",
				);
				return;
			}

			// Delete existing verification tokens
			await db
				.delete(emailVerifications)
				.where(eq(emailVerifications.user_id, user.id));

			// Send verification email
			await sendVerificationEmail(user.id, user.email, user.name);
		} catch (error) {
			log.error({ error, email }, "Error resending verification email");
		}
	},

	verifyEmail: async (token: string): Promise<void> => {
		try {
			const record =
				(
					await db
						.select()
						.from(emailVerifications)
						.where(eq(emailVerifications.token, token))
				)[0] ?? null;

			if (!record || record.expired_at < new Date()) {
				throw new BadRequestError("Validation error", [
					{
						field: "token",
						message: "Invalid or expired verification token",
					},
				]);
			}

			// Get user info before transaction
			const user =
				(
					await db
						.select({ email: users.email, name: users.name })
						.from(users)
						.where(eq(users.id, record.user_id))
				)[0] ?? null;

			await db.transaction(async (trx: DbTransaction) => {
				await trx
					.update(users)
					.set({ email_verified_at: new Date() })
					.where(eq(users.id, record.user_id));

				await trx
					.delete(emailVerifications)
					.where(eq(emailVerifications.user_id, record.user_id));
			});

			// Send welcome email
			if (user) {
				await EmailService.sendWelcomeEmail(user.email, user.name).catch(
					(error) => {
						log.error(
							{ error, userId: record.user_id },
							"Failed to send welcome email",
						);
					},
				);
			}

			log.info({ userId: record.user_id }, "Email verified successfully");
		} catch (error) {
			if (error instanceof BadRequestError) {
				throw error;
			}
			log.error({ error, token }, "Email verification error");
			throw new BadRequestError("Validation error", [
				{
					field: "token",
					message: "An error occurred during email verification",
				},
			]);
		}
	},

	forgotPassword: async (email: string): Promise<void> => {
		try {
			const user = await UserRepository(db)
				.findByEmail(email)
				.catch(() => null);

			if (!user) {
				// Don't reveal if email exists or not
				return;
			}

			if (!user.email_verified_at) {
				// Don't send reset email to unverified accounts
				return;
			}

			await sendResetPasswordEmail(user.id, user.email, user.name);
		} catch (error) {
			log.error({ error, email }, "Error in forgot password");
			// Don't throw error to prevent email enumeration
		}
	},

	resetPassword: async (token: string, password: string): Promise<void> => {
		try {
			const passwordReset =
				(
					await db
						.select()
						.from(passwordResetTokens)
						.where(eq(passwordResetTokens.token, token))
				)[0] ?? null;

			if (!passwordReset || passwordReset.expired_at < new Date()) {
				throw new BadRequestError("Validation error", [
					{
						field: "token",
						message: "Invalid or expired password reset token",
					},
				]);
			}

			const hashedPassword = await HashUtils.generateHash(password);

			await db.transaction(async (trx: DbTransaction) => {
				await trx
					.update(users)
					.set({ password: hashedPassword })
					.where(eq(users.id, passwordReset.user_id));

				await trx
					.delete(passwordResetTokens)
					.where(eq(passwordResetTokens.user_id, passwordReset.user_id));
			});

			log.info(
				{ userId: passwordReset.user_id },
				"Password reset successfully",
			);
		} catch (error) {
			if (error instanceof BadRequestError) {
				throw error;
			}
			log.error({ error, token }, "Password reset error");
			throw new BadRequestError("Validation error", [
				{
					field: "token",
					message: "An error occurred during password reset",
				},
			]);
		}
	},
};

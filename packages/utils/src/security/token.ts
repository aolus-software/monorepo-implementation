import { randomBytes } from "crypto";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class TokenUtils {
	/**
	 * Generate a random secure token
	 * @param length - Length of the token in bytes (default: 32)
	 * @returns URL-safe base64 encoded token
	 */
	static generateToken(length = 32): string {
		return randomBytes(length).toString("base64url");
	}

	/**
	 * Generate a numeric token (useful for OTP)
	 * @param length - Number of digits (default: 6)
	 * @returns Numeric string of specified length
	 */
	static generateNumericToken(length = 6): string {
		const max = Math.pow(10, length) - 1;
		const min = Math.pow(10, length - 1);
		const token = Math.floor(Math.random() * (max - min + 1)) + min;
		return token.toString();
	}
}

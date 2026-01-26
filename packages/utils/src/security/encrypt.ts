import * as CryptoJS from "crypto-js";

export class EncryptionUtils {
	private static secretKey: string;

	constructor(secretKey?: string) {
		if (secretKey) {
			EncryptionUtils.secretKey = secretKey;
		}
	}

	static encrypt(text: string): string {
		return CryptoJS.AES.encrypt(text, this.secretKey).toString();
	}

	static decrypt(encryptedText: string): string {
		const bytes = CryptoJS.AES.decrypt(encryptedText, this.secretKey);
		return bytes.toString(CryptoJS.enc.Utf8);
	}
}

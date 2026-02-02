import * as bcrypt from "bcryptjs";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class HashUtils {
	static async generateHash(value: string): Promise<string> {
		const saltRounds = 10;
		return await bcrypt.hash(value, saltRounds);
	}

	static async compareHash(value: string, hash: string): Promise<boolean> {
		return await bcrypt.compare(value, hash);
	}
}

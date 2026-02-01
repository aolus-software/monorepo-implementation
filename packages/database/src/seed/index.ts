import "dotenv/config";

import { getClient } from "../client";
import { seedPermissions } from "./permissions.seed";
import { seedRoles } from "./roles.seed";
import { seedUsers } from "./users.seed";
import { databaseEnvSchema } from '../../../env/src/index';

const env = databaseEnvSchema.parse(process.env);

if (!env.DATABASE_URL) {
	throw new Error("DATABASE_URL environment variable is not set");
}

async function main(): Promise<void> {
	const db = getClient(env.DATABASE_URL);
	try {
		await seedPermissions(db);
		await seedRoles(db);
		await seedUsers(db);

		// eslint-disable-next-line no-console
		console.log("Seeding completed successfully!");
	} catch (error) {
		console.error("Error during seeding:", error);
		throw error;
	} finally {
		process.exit(0);
	}
}

void main();

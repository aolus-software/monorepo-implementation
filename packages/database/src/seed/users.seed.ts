import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import { HashUtils } from "../../../utils/src/security/hash";
import type { schema } from "../schema";
import { roles, userRoles, users } from "../schema";

const userData = [
	{
		name: "Superuser",
		email: "superuser@example.com",
		password: "SuperuserPass123!",
		status: "active" as const,
		role: "superuser",
	},
	{
		name: "Admin User",
		email: "admin@example.com",
		password: "AdminPass123!",
		status: "active" as const,
		role: "admin",
	},
	{
		name: "Regular User",
		email: "user@example.com",
		password: "UserPass123!",
		status: "active" as const,
		role: "user",
	},
] as const;

export async function seedUsers(
	db: NodePgDatabase<typeof schema>,
): Promise<void> {
	// eslint-disable-next-line no-console
	console.log(`  → Inserting ${userData.length} users...`);

	for (const userInfo of userData) {
		// Insert or update user
		const [user] = await db
			.insert(users)
			.values({
				name: userInfo.name,
				email: userInfo.email,
				password: await HashUtils.generateHash(userInfo.password),
				status: userInfo.status,
				email_verified_at: new Date(),
			})
			.returning();

		// Get the role and assign to user
		const [role] = await db
			.select()
			.from(roles)
			.where(eq(roles.name, userInfo.role));

		if (role && user) {
			await db.delete(userRoles).where(eq(userRoles.user_id, user.id));
			await db.insert(userRoles).values({
				user_id: user.id,
				role_id: role.id,
			});
		}
	}
}

import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { schema } from "../schema";
import { permissions } from "../schema";

export const permissionData = [
	// User Management
	{ name: "users.view", group: "users" },
	{ name: "users.create", group: "users" },
	{ name: "users.edit", group: "users" },
	{ name: "users.delete", group: "users" },
	{ name: "users.export", group: "users" },

	// Role Management
	{ name: "roles.view", group: "roles" },
	{ name: "roles.create", group: "roles" },
	{ name: "roles.edit", group: "roles" },
	{ name: "roles.delete", group: "roles" },

	// Permission Management
	{ name: "permissions.view", group: "permissions" },
	{ name: "permissions.create", group: "permissions" },
	{ name: "permissions.edit", group: "permissions" },
	{ name: "permissions.delete", group: "permissions" },

	// Dashboard
	{ name: "dashboard.view", group: "dashboard" },
	{ name: "dashboard.analytics", group: "dashboard" },

	// Settings
	{ name: "settings.view", group: "settings" },
	{ name: "settings.edit", group: "settings" },
] as const;

export async function seedPermissions(
	db: NodePgDatabase<typeof schema>,
): Promise<void> {
	// eslint-disable-next-line no-console
	console.log(`  → Inserting ${permissionData.length} permissions...`);

	await db
		.insert(permissions)
		.values(
			permissionData.map((perm) => ({
				name: perm.name,
				group: perm.group,
			})),
		)
		.onConflictDoNothing({ target: permissions.name });

	// eslint-disable-next-line no-console
	console.log(`  ✓ Permissions seeded`);
}

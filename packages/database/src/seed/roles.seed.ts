import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import type { schema } from "../schema";
import { permissions, rolePermissions, roles } from "../schema";

const roleData = [
	{
		name: "superuser",
		description: "Full system access with all permissions",
	},
	{
		name: "admin",
		description: "Administrative access with most permissions",
	},
	{
		name: "user",
		description: "Basic user access",
	},
] as const;

// Define role-permission mappings
const rolePermissionMappings = {
	superuser: "all", // All permissions
	admin: [
		"users.view",
		"users.create",
		"users.edit",
		"users.export",
		"roles.view",
		"permissions.view",
		"dashboard.view",
		"dashboard.analytics",
		"settings.view",
		"settings.edit",
	],
	user: ["dashboard.view", "settings.view"],
} as const;

export async function seedRoles(
	db: NodePgDatabase<typeof schema>,
): Promise<void> {
	// Insert roles
	for (const roleInfo of roleData) {
		const [role] = await db
			.insert(roles)
			.values({ name: roleInfo.name })
			.onConflictDoUpdate({
				target: roles.name,
				set: { updated_at: new Date() },
			})
			.returning();

		// Get all permissions
		const allPermissions = await db.select().from(permissions);
		const permissionMapping = rolePermissionMappings[roleInfo.name];
		let permissionsToAssign;

		if (permissionMapping === "all") {
			permissionsToAssign = allPermissions;
		} else {
			permissionsToAssign = allPermissions.filter((p) =>
				(permissionMapping as readonly string[]).includes(p.name),
			);
		}

    // Clear existing role-permission assignments
		await db
			.delete(rolePermissions)
			.where(eq(rolePermissions.role_id, role.id));

		if (permissionsToAssign.length > 0) {
			await db.insert(rolePermissions).values(
				permissionsToAssign.map((p) => ({
					role_id: role.id,
					permission_id: p.id,
				})),
			);
		}
	}
}

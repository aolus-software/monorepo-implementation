import { BadRequestError } from "@repo/types";
import { and, eq, inArray } from "drizzle-orm";

import { roles, userRoles } from "../schema";
import type { DbClient, DbTransaction } from ".";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const UserRbacRepository = (dbInstance: DbClient) => {
	return {
		db: dbInstance,
		getDb: (tx?: DbTransaction): DbClient | DbTransaction => tx ?? dbInstance,

		/**
		 * Assign roles to user
		 */
		assignRoles: async (
			userId: string,
			roleIds: string[],
			tx?: DbTransaction,
		): Promise<void> => {
			const database = tx ?? dbInstance;

			// Verify all roles exist
			if (roleIds.length > 0) {
				const existingRoles = await database.query.roles.findMany({
					where: inArray(roles.id, roleIds),
				});

				if (existingRoles.length !== roleIds.length) {
					throw new BadRequestError("Some roles do not exist");
				}
			}

			// Remove existing roles
			await database.delete(userRoles).where(eq(userRoles.user_id, userId));

			// Add new roles
			if (roleIds.length > 0) {
				await database.insert(userRoles).values(
					roleIds.map((roleId) => ({
						user_id: userId,
						role_id: roleId,
					})),
				);
			}
		},

		/**
		 * Get user's roles
		 */
		getUserRoles: async (userId: string, tx?: DbTransaction) => {
			const database = tx ?? dbInstance;

			const userRolesData = await database.query.userRoles.findMany({
				where: eq(userRoles.user_id, userId),
				with: {
					role: true,
				},
			});

			return userRolesData.map((ur) => ur.role);
		},

		/**
		 * Remove role from user
		 */
		removeRole: async (
			userId: string,
			roleId: string,
			tx?: DbTransaction,
		): Promise<void> => {
			const database = tx ?? dbInstance;

			await database
				.delete(userRoles)
				.where(
					and(eq(userRoles.user_id, userId), eq(userRoles.role_id, roleId)),
				);
		},
	};
};

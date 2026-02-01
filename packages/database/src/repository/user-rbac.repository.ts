import { eq, inArray } from "drizzle-orm";
import { DbClient, DbTransaction } from ".";
import { userRoles, roles } from "../schema";
import {
	BadRequestError,
	NotFoundError,
} from "@repo/elysia";

export const UserRbacRepository = (dbInstance: DbClient) => {
	return {
		db: dbInstance,
		getDb: (tx?: DbTransaction) => tx || (dbInstance as any).$cache,

		/**
		 * Assign roles to user
		 */
		assignRoles: async (
			userId: string,
			roleIds: string[],
			tx?: DbTransaction,
		): Promise<void> => {
			const database = tx || dbInstance;

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
			await database
				.delete(userRoles)
				.where(eq(userRoles.user_id, userId));

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
		getUserRoles: async (
			userId: string,
			tx?: DbTransaction,
		) => {
			const database = tx || dbInstance;

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
			const database = tx || dbInstance;

			await database
				.delete(userRoles)
				.where(
					eq(userRoles.user_id, userId) && eq(userRoles.role_id, roleId),
				);
		},
	};
};

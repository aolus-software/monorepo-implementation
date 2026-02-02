import type {
	DatatableType,
	PaginationResponse,
	RoleCreate,
	RoleDetail,
	RoleList,
	RoleWithPermissions,
} from "@repo/types";
import { BadRequestError, NotFoundError } from "@repo/types";
import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";

import { permissions, rolePermissions, roles } from "../schema";
import type { DbClient, DbTransaction } from ".";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const RoleRepository = (dbInstance: DbClient) => {
	return {
		db: dbInstance,
		getDb: (tx?: DbTransaction): DbClient | DbTransaction => tx ?? dbInstance,

		/**
		 * Get all roles with pagination and filtering
		 */
		findAll: async (
			queryParam: DatatableType<{
				name: string;
			}>,
			tx?: DbTransaction,
		): Promise<PaginationResponse<RoleList>> => {
			const database = tx ?? dbInstance;

			const page = queryParam.page;
			const limit = queryParam.perPage;
			const offset: number = (page - 1) * limit;

			// Build WHERE conditions
			const conditions: SQL[] = [];

			// Filter by name
			if (queryParam.filter?.name) {
				conditions.push(ilike(roles.name, `%${queryParam.filter.name}%`));
			}

			// Global search
			if (queryParam.search) {
				conditions.push(ilike(roles.name, `%${queryParam.search}%`));
			}

			const whereClause =
				conditions.length > 0 ? and(...conditions) : undefined;

			// Determine sort direction
			const sortDirection = queryParam.sortDirection === "asc" ? asc : desc;

			// Determine sort field
			let sortField = roles.created_at;
			if (queryParam.sort === "name") {
				sortField = roles.name;
			}

			// Fetch data with permissions count
			const data = await database.query.roles.findMany({
				where: whereClause,
				orderBy: [sortDirection(sortField)],
				limit,
				offset,
				with: {
					role_permissions: {
						with: {
							permission: true,
						},
					},
				},
			});

			// Count total
			const countResult = await database
				.select({ count: roles.id })
				.from(roles)
				.where(whereClause);

			const totalCount = countResult.length;

			return {
				data: data.map((item) => ({
					id: item.id,
					name: item.name,
					permissions_count: item.role_permissions.length,
					created_at: item.created_at,
					updated_at: item.updated_at,
				})),
				meta: {
					page,
					limit,
					totalCount,
				},
			};
		},

		/**
		 * Find role by ID
		 */
		findById: async (
			id: string,
			tx?: DbTransaction,
		): Promise<RoleDetail | null> => {
			const database = tx ?? dbInstance;

			const role = await database.query.roles.findFirst({
				where: eq(roles.id, id),
				with: {
					role_permissions: {
						with: {
							permission: true,
						},
					},
				},
			});

			if (!role) {
				return null;
			}

			return {
				id: role.id,
				name: role.name,
				permissions: role.role_permissions.map((rp) => ({
					id: rp.permission.id,
					name: rp.permission.name,
					group: rp.permission.group,
				})),
				created_at: role.created_at,
				updated_at: role.updated_at,
			};
		},

		/**
		 * Find role by ID with all permissions (including unassigned)
		 * Shows all available permissions with a flag indicating if assigned to this role
		 */
		findByIdWithAllPermissions: async (
			id: string,
			tx?: DbTransaction,
		): Promise<RoleWithPermissions | null> => {
			const database = tx ?? dbInstance;

			// Get role with its permissions
			const role = await database.query.roles.findFirst({
				where: eq(roles.id, id),
				with: {
					role_permissions: {
						with: {
							permission: true,
						},
					},
				},
			});

			if (!role) {
				return null;
			}

			// Get all available permissions
			const allPermissions = await database.query.permissions.findMany({
				orderBy: [asc(permissions.group), asc(permissions.name)],
			});

			// Create a set of assigned permission IDs for quick lookup
			const assignedPermissionIds = new Set(
				role.role_permissions.map((rp) => rp.permission.id),
			);

			// Map all permissions with assigned flag
			const permissionsWithAssignment = allPermissions.map((permission) => ({
				id: permission.id,
				name: permission.name,
				group: permission.group,
				assigned: assignedPermissionIds.has(permission.id),
			}));

			return {
				id: role.id,
				name: role.name,
				permissions: permissionsWithAssignment,
				created_at: role.created_at,
				updated_at: role.updated_at,
			};
		},

		/**
		 * Create role
		 */
		create: async (
			data: RoleCreate,
			tx?: DbTransaction,
		): Promise<RoleDetail> => {
			const database = tx ?? dbInstance;

			// Check if role already exists
			const existing = await database.query.roles.findFirst({
				where: eq(roles.name, data.name),
			});

			if (existing) {
				throw new BadRequestError(`Role '${data.name}' already exists`);
			}

			// Create role
			const [role] = await database
				.insert(roles)
				.values({
					name: data.name,
				})
				.returning();

			// Assign permissions if provided
			if (data.permission_ids && data.permission_ids.length > 0) {
				await database.insert(rolePermissions).values(
					data.permission_ids.map((permissionId) => ({
						role_id: role.id,
						permission_id: permissionId,
					})),
				);
			}

			// Fetch the created role with permissions
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
			const createdRole = await this.findById(role.id, database);
			if (!createdRole) {
				throw new NotFoundError("Failed to retrieve created role");
			}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return createdRole;
		},

		/**
		 * Update role
		 */
		update: async (
			id: string,
			data: Partial<RoleCreate>,
			tx?: DbTransaction,
		): Promise<RoleDetail> => {
			const database = tx ?? dbInstance;

			// Check if role exists
			const existing = await database.query.roles.findFirst({
				where: eq(roles.id, id),
			});

			if (!existing) {
				throw new NotFoundError("Role not found");
			}

			// If name is being updated, check for duplicates
			if (data.name && data.name !== existing.name) {
				const duplicate = await database.query.roles.findFirst({
					where: eq(roles.name, data.name),
				});

				if (duplicate) {
					throw new BadRequestError(`Role '${data.name}' already exists`);
				}
			}

			// Update role name if provided
			if (data.name) {
				await database
					.update(roles)
					.set({
						name: data.name,
						updated_at: new Date(),
					})
					.where(eq(roles.id, id));
			}

			// Update permissions if provided
			if (data.permission_ids !== undefined) {
				// Remove all existing permissions
				await database
					.delete(rolePermissions)
					.where(eq(rolePermissions.role_id, id));

				// Add new permissions
				if (data.permission_ids.length > 0) {
					await database.insert(rolePermissions).values(
						data.permission_ids.map((permissionId) => ({
							role_id: id,
							permission_id: permissionId,
						})),
					);
				}
			}

			// Fetch the updated role with permissions
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
			const updatedRole = await this.findById(id, database);
			if (!updatedRole) {
				throw new NotFoundError("Failed to retrieve updated role");
			}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return updatedRole;
		},

		/**
		 * Delete role
		 */
		delete: async (id: string, tx?: DbTransaction): Promise<void> => {
			const database = tx ?? dbInstance;

			const existing = await database.query.roles.findFirst({
				where: eq(roles.id, id),
			});

			if (!existing) {
				throw new NotFoundError("Role not found");
			}

			// Delete role (cascade will handle role_permissions and user_roles)
			await database.delete(roles).where(eq(roles.id, id));
		},

		/**
		 * Assign permissions to role
		 */
		assignPermissions: async (
			roleId: string,
			permissionIds: string[],
			tx?: DbTransaction,
		): Promise<void> => {
			const database = tx ?? dbInstance;

			// Verify role exists
			const role = await database.query.roles.findFirst({
				where: eq(roles.id, roleId),
			});

			if (!role) {
				throw new NotFoundError("Role not found");
			}

			// Verify all permissions exist
			const existingPermissions = await database.query.permissions.findMany({
				where: inArray(permissions.id, permissionIds),
			});

			if (existingPermissions.length !== permissionIds.length) {
				throw new BadRequestError("Some permissions do not exist");
			}

			// Remove existing permissions
			await database
				.delete(rolePermissions)
				.where(eq(rolePermissions.role_id, roleId));

			// Add new permissions
			if (permissionIds.length > 0) {
				await database.insert(rolePermissions).values(
					permissionIds.map((permissionId) => ({
						role_id: roleId,
						permission_id: permissionId,
					})),
				);
			}
		},

		/**
		 * Get all roles as select options
		 */
		selectOptions: async (
			tx?: DbTransaction,
		): Promise<{ value: string; label: string }[]> => {
			const database = tx ?? dbInstance;

			const data = await database.query.roles.findMany({
				orderBy: [asc(roles.name)],
				columns: {
					id: true,
					name: true,
				},
			});

			return data.map((role) => ({
				value: role.id,
				label: role.name,
			}));
		},
	};
};

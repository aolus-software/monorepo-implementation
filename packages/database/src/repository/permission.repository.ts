import type {
	DatatableType,
	PaginationResponse,
	PermissionCreate,
	PermissionDetail,
	PermissionList,
} from "@repo/types";
import { BadRequestError, NotFoundError } from "@repo/types";
import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, ilike, or } from "drizzle-orm";

import { permissions } from "../schema";
import type { DbClient, DbTransaction } from ".";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const PermissionRepository = (dbInstance: DbClient) => {
	return {
		db: dbInstance,
		getDb: (tx?: DbTransaction): DbClient | DbTransaction => tx ?? dbInstance,

		/**
		 * Get all permissions with pagination and filtering
		 */
		findAll: async (
			queryParam: DatatableType<{
				group: string;
				name: string;
			}>,
			tx?: DbTransaction,
		): Promise<PaginationResponse<PermissionList>> => {
			const database = tx ?? dbInstance;

			const page = queryParam.page;
			const limit = queryParam.perPage;
			const offset: number = (page - 1) * limit;

			// Build WHERE conditions
			const conditions: SQL[] = [];

			// Filter by group
			if (queryParam.filter?.group) {
				conditions.push(
					ilike(permissions.group, `%${queryParam.filter.group}%`),
				);
			}

			// Filter by name
			if (queryParam.filter?.name) {
				conditions.push(ilike(permissions.name, `%${queryParam.filter.name}%`));
			}

			// Global search
			if (queryParam.search) {
				const searchCondition = or(
					ilike(permissions.name, `%${queryParam.search}%`),
					ilike(permissions.group, `%${queryParam.search}%`),
				);
				if (searchCondition) {
					conditions.push(searchCondition);
				}
			}

			const whereClause =
				conditions.length > 0 ? and(...conditions) : undefined;

			// Determine sort direction
			const sortDirection = queryParam.sortDirection === "asc" ? asc : desc;

			// Determine sort field
			let sortField:
				| typeof permissions.created_at
				| typeof permissions.name
				| typeof permissions.group = permissions.created_at;
			if (queryParam.sort === "name") {
				sortField = permissions.name;
			} else if (queryParam.sort === "group") {
				sortField = permissions.group;
			}

			// Fetch data
			const data = await database.query.permissions.findMany({
				where: whereClause,
				orderBy: [sortDirection(sortField)],
				limit,
				offset,
			});

			// Count total
			const countResult = await database
				.select({ count: permissions.id })
				.from(permissions)
				.where(whereClause);

			const totalCount = countResult.length;

			return {
				data: data.map((item) => ({
					id: item.id,
					name: item.name,
					group: item.group,
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
		 * Find permission by ID
		 */
		findById: async (
			id: string,
			tx?: DbTransaction,
		): Promise<PermissionDetail | null> => {
			const database = tx ?? dbInstance;

			const permission = await database.query.permissions.findFirst({
				where: eq(permissions.id, id),
			});

			if (!permission) {
				return null;
			}

			return {
				id: permission.id,
				name: permission.name,
				group: permission.group,
				created_at: permission.created_at,
				updated_at: permission.updated_at,
			};
		},

		/**
		 * Create a single permission
		 */
		create: async (
			data: PermissionCreate,
			tx?: DbTransaction,
		): Promise<PermissionDetail> => {
			const database = tx ?? dbInstance;

			// Check if permission already exists
			const existing = await database.query.permissions.findFirst({
				where: eq(permissions.name, data.name),
			});

			if (existing) {
				throw new BadRequestError(`Permission '${data.name}' already exists`);
			}

			const [permission] = await database
				.insert(permissions)
				.values({
					name: data.name,
					group: data.group,
				})
				.returning();

			if (!permission) {
				throw new BadRequestError(
					"Failed to create permission, please try again",
				);
			}

			return {
				id: permission.id,
				name: permission.name,
				group: permission.group,
				created_at: permission.created_at,
				updated_at: permission.updated_at,
			};
		},

		/**
		 * Create multiple permissions at once
		 * Format: group:name or just name with group
		 */
		createBulk: async (
			group: string,
			names: string[],
			tx?: DbTransaction,
		): Promise<PermissionDetail[]> => {
			const database = tx ?? dbInstance;

			// Prepare data with format group:name
			const permissionsData = names.map((name) => ({
				name: `${group}:${name.trim()}`,
				group: group,
			}));

			// Check for existing permissions
			const existingPermissions = await database.query.permissions.findMany({
				where: or(...permissionsData.map((p) => eq(permissions.name, p.name))),
			});

			if (existingPermissions.length > 0) {
				const existingNames = existingPermissions.map((p) => p.name).join(", ");
				throw new BadRequestError(
					`Some permissions already exist: ${existingNames}`,
				);
			}

			// Insert all permissions
			const created = await database
				.insert(permissions)
				.values(permissionsData)
				.returning();

			return created.map((item) => ({
				id: item.id,
				name: item.name,
				group: item.group,
				created_at: item.created_at,
				updated_at: item.updated_at,
			}));
		},

		/**
		 * Update permission
		 */
		update: async (
			id: string,
			data: Partial<PermissionCreate>,
			tx?: DbTransaction,
		): Promise<PermissionDetail> => {
			const database = tx ?? dbInstance;

			// Check if permission exists
			const existing = await database.query.permissions.findFirst({
				where: eq(permissions.id, id),
			});

			if (!existing) {
				throw new NotFoundError("Permission not found");
			}

			// If name is being updated, check for duplicates
			if (data.name && data.name !== existing.name) {
				const duplicate = await database.query.permissions.findFirst({
					where: eq(permissions.name, data.name),
				});

				if (duplicate) {
					throw new BadRequestError(`Permission '${data.name}' already exists`);
				}
			}

			const [updated] = await database
				.update(permissions)
				.set({
					...(data.name && { name: data.name }),
					...(data.group && { group: data.group }),
					updated_at: new Date(),
				})
				.where(eq(permissions.id, id))
				.returning();

			if (!updated) {
				throw new BadRequestError(
					"Failed to update permission, please try again",
				);
			}

			return {
				id: updated.id,
				name: updated.name,
				group: updated.group,
				created_at: updated.created_at,
				updated_at: updated.updated_at,
			};
		},

		/**
		 * Delete permission
		 */
		delete: async (id: string, tx?: DbTransaction): Promise<void> => {
			const database = tx ?? dbInstance;

			const existing = await database.query.permissions.findFirst({
				where: eq(permissions.id, id),
			});

			if (!existing) {
				throw new NotFoundError("Permission not found");
			}

			await database.delete(permissions).where(eq(permissions.id, id));
		},

		/**
		 * Get all permissions as select options
		 */
		selectOptions: async (
			tx?: DbTransaction,
		): Promise<{ value: string; label: string; group: string }[]> => {
			const database = tx ?? dbInstance;

			const data = await database.query.permissions.findMany({
				orderBy: [asc(permissions.group), asc(permissions.name)],
				columns: {
					id: true,
					name: true,
					group: true,
				},
			});

			return data.map((permission) => ({
				value: permission.id,
				label: permission.name,
				group: permission.group,
			}));
		},

		/**
		 * Get all permissions grouped by group
		 */
		getAllGrouped: async (tx?: DbTransaction) => {
			const database = tx ?? dbInstance;

			const data = await database.query.permissions.findMany({
				orderBy: [asc(permissions.group), asc(permissions.name)],
			});

			// Group by group
			const grouped = data.reduce<Record<string, typeof data>>(
				(acc, permission) => {
					const group = (acc[permission.group] ??= []);

					group.push(permission);
					return acc;
				},
				{},
			);

			return grouped;
		},
	};
};

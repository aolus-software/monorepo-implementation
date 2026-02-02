import { PermissionRepository } from "@repo/database";
import type {
	DatatableType,
	PaginationResponse,
	PermissionBulkCreate,
	PermissionCreate,
	PermissionDetail,
	PermissionList,
} from "@repo/types";

import { db } from "../../../db";

const permissionRepo = PermissionRepository(db);

export const PermissionService = {
	/**
	 * Get all permissions with pagination
	 */
	findAll: async (
		queryParam: DatatableType<{
			group: string;
			name: string;
		}>,
	): Promise<PaginationResponse<PermissionList>> => {
		return await permissionRepo.findAll(queryParam);
	},

	/**
	 * Get permission by ID
	 */
	findById: async (id: string): Promise<PermissionDetail> => {
		const permission = await permissionRepo.findById(id);

		if (!permission) {
			throw new Error("Permission not found");
		}

		return permission;
	},

	/**
	 * Create single permission
	 */
	create: async (data: PermissionCreate): Promise<PermissionDetail> => {
		return await permissionRepo.create(data);
	},

	/**
	 * Create multiple permissions at once
	 */
	createBulk: async (
		data: PermissionBulkCreate,
	): Promise<PermissionDetail[]> => {
		return await permissionRepo.createBulk(data.group, data.names);
	},

	/**
	 * Update permission
	 */
	update: async (
		id: string,
		data: Partial<PermissionCreate>,
	): Promise<PermissionDetail> => {
		return await permissionRepo.update(id, data);
	},

	/**
	 * Delete permission
	 */
	delete: async (id: string): Promise<void> => {
		await permissionRepo.delete(id);
	},
};

import { RoleRepository } from "@repo/database";
import type {
	DatatableType,
	PaginationResponse,
	RoleCreate,
	RoleDetail,
	RoleList,
	RoleWithPermissions,
} from "@repo/types";

import { db } from "../../../db";

const roleRepo = RoleRepository(db);

export const RoleService = {
	/**
	 * Get all roles with pagination
	 */
	findAll: async (
		queryParam: DatatableType<{
			name: string;
		}>,
	): Promise<PaginationResponse<RoleList>> => {
		return await roleRepo.findAll(queryParam);
	},

	/**
	 * Get role by ID
	 */
	findById: async (id: string): Promise<RoleDetail> => {
		const role = await roleRepo.findById(id);

		if (!role) {
			throw new Error("Role not found");
		}

		return role;
	},

	/**
	 * Get role by ID with all permissions (showing assignment status)
	 */
	findByIdWithAllPermissions: async (
		id: string,
	): Promise<RoleWithPermissions> => {
		const role = await roleRepo.findByIdWithAllPermissions(id);

		if (!role) {
			throw new Error("Role not found");
		}

		return role;
	},

	/**
	 * Create role
	 */
	create: async (data: RoleCreate): Promise<RoleDetail> => {
		return await roleRepo.create(data);
	},

	/**
	 * Update role
	 */
	update: async (
		id: string,
		data: Partial<RoleCreate>,
	): Promise<RoleDetail> => {
		return await roleRepo.update(id, data);
	},

	/**
	 * Delete role
	 */
	delete: async (id: string): Promise<void> => {
		await roleRepo.delete(id);
	},

	/**
	 * Assign permissions to role
	 */
	assignPermissions: async (
		roleId: string,
		permissionIds: string[],
	): Promise<void> => {
		await roleRepo.assignPermissions(roleId, permissionIds);
	},
};

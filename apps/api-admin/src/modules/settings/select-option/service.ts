import { PermissionRepository, RoleRepository } from "@repo/database";

import { db } from "../../../db";

/**
 * Select Option Service
 *
 * Provides formatted select options for various resources
 */
export const SelectOptionService = {
	/**
	 * Get permission select options
	 */
	permissionSelect: async (): Promise<
		{ value: string; label: string; group: string }[]
	> => {
		return await PermissionRepository(db).selectOptions();
	},

	/**
	 * Get role select options
	 */
	roleSelect: async (): Promise<{ value: string; label: string }[]> => {
		return await RoleRepository(db).selectOptions();
	},
};

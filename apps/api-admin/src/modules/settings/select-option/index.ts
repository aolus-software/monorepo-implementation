import { ResponseUtils } from "@repo/elysia";
import Elysia from "elysia";

import { baseAuthApp } from "../../../base-auth";
import { SelectOptionService } from "./service";

/**
 * Select Option Module
 *
 * Provides select options for various resources in settings.
 * All endpoints require authentication and superuser role.
 *
 * Available options:
 * - Permissions: For role management
 * - Roles: For user management
 */
export const SelectOptionModule = new Elysia({
	prefix: "/select-options",
	detail: {
		tags: ["Settings/Select Options"],
		description: "APIs for retrieving select options for settings",
	},
})
	.use(baseAuthApp)

	// ============================================
	// GET PERMISSION SELECT OPTIONS
	// ============================================
	.get(
		"/permissions",
		async () => {
			const permissions = await SelectOptionService.permissionSelect();
			return ResponseUtils.success(
				permissions,
				"Permission select options retrieved successfully",
				200,
			);
		},
		{
			detail: {
				summary: "Get permission select options",
				description:
					"Retrieve select options for permissions. Requires authentication and superuser role.",
			},
			rbac: { roles: ["superuser"] },
		},
	)

	// ============================================
	// GET ROLE SELECT OPTIONS
	// ============================================
	.get(
		"/roles",
		async () => {
			const roles = await SelectOptionService.roleSelect();
			return ResponseUtils.success(
				roles,
				"Role select options retrieved successfully",
				200,
			);
		},
		{
			detail: {
				summary: "Get role select options",
				description:
					"Retrieve select options for roles. Requires authentication and superuser role.",
			},
			rbac: { roles: ["superuser"] },
		},
	);

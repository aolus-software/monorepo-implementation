import Elysia, { t } from "elysia";
import { baseAuthApp } from "../../../base-auth";
import {
	CommonResponseSchemas,
	ResponseUtils,
	SuccessResponseSchema,
} from "@repo/elysia";
import { RoleService } from "./service";
import {
	AssignPermissionsSchema,
	CreateRoleSchema,
	RoleDatatableQuerySchema,
	RolePaginationResponseSchema,
	RoleResponseSchema,
	RoleWithPermissionsResponseSchema,
	UpdateRoleSchema,
} from "./schema";

export const RoleModule = new Elysia({
	prefix: "/roles",
	detail: {
		tags: ["Settings - Roles"],
		description: "Role management endpoints",
	},
})
	.use(baseAuthApp)

	// ============================================
	// GET ALL ROLES (with pagination)
	// ============================================
	.get(
		"/",
		async ({ query, set }) => {
			const queryParam = {
				page: query.page || 1,
				perPage: query.perPage || 10,
				search: query.search,
				sort: query.sort || "created_at",
				sortDirection: query.sortDirection || "desc",
				filter: {
					name: query["filter[name]"],
				},
			};

			const result = await RoleService.findAll(queryParam as any);

			set.status = 200;
			return ResponseUtils.success(result, "Roles retrieved successfully");
		},
		{
			query: RoleDatatableQuerySchema,
			response: {
				200: SuccessResponseSchema(RolePaginationResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
			},
			detail: {
				summary: "Get all roles",
				description: "Get paginated list of roles with filtering",
			},
		},
	)

	// ============================================
	// GET ROLE BY ID
	// ============================================
	.get(
		"/:id",
		async ({ params, set }) => {
			const role = await RoleService.findById(params.id);

			set.status = 200;
			return ResponseUtils.success(role, "Role retrieved successfully");
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: SuccessResponseSchema(RoleResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
			},
			detail: {
				summary: "Get role by ID",
				description: "Get detailed information about a specific role",
			},
		},
	)

	// ============================================
	// GET ROLE WITH ALL PERMISSIONS (showing assignment status)
	// ============================================
	.get(
		"/:id/permissions",
		async ({ params, set }) => {
			const role = await RoleService.findByIdWithAllPermissions(params.id);

			set.status = 200;
			return ResponseUtils.success(
				role,
				"Role with all permissions retrieved successfully",
			);
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: SuccessResponseSchema(RoleWithPermissionsResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
			},
			detail: {
				summary: "Get role with all permissions",
				description:
					"Get role with all available permissions and their assignment status. Each permission includes an 'assigned' flag indicating if it's assigned to this role.",
			},
		},
	)

	// ============================================
	// CREATE ROLE
	// ============================================
	.post(
		"/",
		async ({ body, set }) => {
			const role = await RoleService.create(body);

			set.status = 201;
			return ResponseUtils.success(role, "Role created successfully");
		},
		{
			body: CreateRoleSchema,
			response: {
				201: SuccessResponseSchema(RoleResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				422: CommonResponseSchemas[422],
			},
			detail: {
				summary: "Create role",
				description: "Create a new role with optional permission assignments",
			},
		},
	)

	// ============================================
	// UPDATE ROLE
	// ============================================
	.patch(
		"/:id",
		async ({ params, body, set }) => {
			const role = await RoleService.update(params.id, body);

			set.status = 200;
			return ResponseUtils.success(role, "Role updated successfully");
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: UpdateRoleSchema,
			response: {
				200: SuccessResponseSchema(RoleResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
				422: CommonResponseSchemas[422],
			},
			detail: {
				summary: "Update role",
				description: "Update an existing role and its permission assignments",
			},
		},
	)

	// ============================================
	// DELETE ROLE
	// ============================================
	.delete(
		"/:id",
		async ({ params, set }) => {
			await RoleService.delete(params.id);

			set.status = 200;
			return ResponseUtils.success(null, "Role deleted successfully");
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: SuccessResponseSchema(t.Null()),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
			},
			detail: {
				summary: "Delete role",
				description: "Delete a role",
			},
		},
	)

	// ============================================
	// ASSIGN PERMISSIONS TO ROLE
	// ============================================
	.post(
		"/:id/permissions",
		async ({ params, body, set }) => {
			await RoleService.assignPermissions(params.id, body.permission_ids);

			set.status = 200;
			return ResponseUtils.success(
				null,
				"Permissions assigned to role successfully",
			);
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: AssignPermissionsSchema,
			response: {
				200: SuccessResponseSchema(t.Null()),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
				422: CommonResponseSchemas[422],
			},
			detail: {
				summary: "Assign permissions to role",
				description:
					"Replace all existing permissions of a role with the provided list",
			},
		},
	)

	// ============================================
	// GET SELECT OPTIONS
	// ============================================
	.get(
		"/select/options",
		async ({ set }) => {
			const options = await RoleService.selectOptions();

			set.status = 200;
			return ResponseUtils.success(
				options,
				"Role options retrieved successfully",
			);
		},
		{
			response: {
				200: SuccessResponseSchema(
					t.Array(
						t.Object({
							value: t.String(),
							label: t.String(),
						}),
					),
				),
				401: CommonResponseSchemas[401],
			},
			detail: {
				summary: "Get role select options",
				description: "Get all roles formatted for select dropdowns",
			},
		},
	);

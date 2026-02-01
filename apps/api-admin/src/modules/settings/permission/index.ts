import Elysia, { t } from "elysia";
import { baseAuthApp } from "../../../base-auth";
import {
	CommonResponseSchemas,
	ResponseUtils,
	SuccessResponseSchema,
} from "@repo/elysia";
import { PermissionService } from "./service";
import {
	CreateBulkPermissionSchema,
	CreatePermissionSchema,
	PermissionDatatableQuerySchema,
	PermissionListResponseSchema,
	PermissionPaginationResponseSchema,
	PermissionResponseSchema,
	UpdatePermissionSchema,
} from "./schema";

export const PermissionModule = new Elysia({
	prefix: "/permissions",
	detail: {
		tags: ["Settings - Permissions"],
		description: "Permission management endpoints",
	},
})
	.use(baseAuthApp)

	// ============================================
	// GET ALL PERMISSIONS (with pagination)
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
					group: query["filter[group]"],
					name: query["filter[name]"],
				},
			};

			const result = await PermissionService.findAll(queryParam as any);

			set.status = 200;
			return ResponseUtils.success(result, "Permissions retrieved successfully");
		},
		{
			query: PermissionDatatableQuerySchema,
			response: {
				200: SuccessResponseSchema(PermissionPaginationResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
			},
			detail: {
				summary: "Get all permissions",
				description: "Get paginated list of permissions with filtering",
			},
		},
	)

	// ============================================
	// GET PERMISSION BY ID
	// ============================================
	.get(
		"/:id",
		async ({ params, set }) => {
			const permission = await PermissionService.findById(params.id);

			set.status = 200;
			return ResponseUtils.success(
				permission,
				"Permission retrieved successfully",
			);
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: SuccessResponseSchema(PermissionResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
			},
			detail: {
				summary: "Get permission by ID",
				description: "Get detailed information about a specific permission",
			},
		},
	)

	// ============================================
	// CREATE PERMISSION
	// ============================================
	.post(
		"/",
		async ({ body, set }) => {
			const permission = await PermissionService.create(body);

			set.status = 201;
			return ResponseUtils.success(
				permission,
				"Permission created successfully",
			);
		},
		{
			body: CreatePermissionSchema,
			response: {
				201: SuccessResponseSchema(PermissionResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				422: CommonResponseSchemas[422],
			},
			detail: {
				summary: "Create permission",
				description: "Create a new permission",
			},
		},
	)

	// ============================================
	// CREATE BULK PERMISSIONS
	// ============================================
	.post(
		"/bulk",
		async ({ body, set }) => {
			const permissions = await PermissionService.createBulk(body);

			set.status = 201;
			return ResponseUtils.success(
				permissions,
				"Permissions created successfully",
			);
		},
		{
			body: CreateBulkPermissionSchema,
			response: {
				201: SuccessResponseSchema(PermissionListResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				422: CommonResponseSchemas[422],
			},
			detail: {
				summary: "Create multiple permissions",
				description:
					"Create multiple permissions at once with the same group. Permissions will be formatted as 'group:name'",
			},
		},
	)

	// ============================================
	// UPDATE PERMISSION
	// ============================================
	.patch(
		"/:id",
		async ({ params, body, set }) => {
			const permission = await PermissionService.update(params.id, body);

			set.status = 200;
			return ResponseUtils.success(
				permission,
				"Permission updated successfully",
			);
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: UpdatePermissionSchema,
			response: {
				200: SuccessResponseSchema(PermissionResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
				422: CommonResponseSchemas[422],
			},
			detail: {
				summary: "Update permission",
				description: "Update an existing permission",
			},
		},
	)

	// ============================================
	// DELETE PERMISSION
	// ============================================
	.delete(
		"/:id",
		async ({ params, set }) => {
			await PermissionService.delete(params.id);

			set.status = 200;
			return ResponseUtils.success(null, "Permission deleted successfully");
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
				summary: "Delete permission",
				description: "Delete a permission",
			},
		},
	)

	// ============================================
	// GET SELECT OPTIONS
	// ============================================
	.get(
		"/select/options",
		async ({ set }) => {
			const options = await PermissionService.selectOptions();

			set.status = 200;
			return ResponseUtils.success(
				options,
				"Permission options retrieved successfully",
			);
		},
		{
			response: {
				200: SuccessResponseSchema(
					t.Array(
						t.Object({
							value: t.String(),
							label: t.String(),
							group: t.String(),
						}),
					),
				),
				401: CommonResponseSchemas[401],
			},
			detail: {
				summary: "Get permission select options",
				description: "Get all permissions formatted for select dropdowns",
			},
		},
	)

	// ============================================
	// GET GROUPED PERMISSIONS
	// ============================================
	.get(
		"/grouped/all",
		async ({ set }) => {
			const grouped = await PermissionService.getAllGrouped();

			set.status = 200;
			return ResponseUtils.success(
				grouped,
				"Grouped permissions retrieved successfully",
			);
		},
		{
			response: {
				200: SuccessResponseSchema(t.Any()),
				401: CommonResponseSchemas[401],
			},
			detail: {
				summary: "Get permissions grouped by group",
				description: "Get all permissions organized by their group",
			},
		},
	);

import Elysia, { t } from "elysia";
import { baseAuthApp } from "../../../base-auth";
import {
	CommonResponseSchemas,
	ResponseUtils,
	SuccessResponseSchema,
} from "@repo/elysia";
import { UserService } from "./service";
import {
	CreateUserSchema,
	UpdateUserSchema,
	UserDatatableQuerySchema,
	UserPaginationResponseSchema,
	UserResponseSchema,
} from "./schema";

export const UserModule = new Elysia({
	prefix: "/users",
	detail: {
		tags: ["Settings - Users"],
		description: "User management endpoints",
	},
})
	.use(baseAuthApp)

	// ============================================
	// GET ALL USERS (with pagination)
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
					status: query["filter[status]"],
					name: query["filter[name]"],
					email: query["filter[email]"],
					role_id: query["filter[role_id]"],
				},
			};

			const result = await UserService.findAll(queryParam as any);

			set.status = 200;
			return ResponseUtils.success(result, "Users retrieved successfully");
		},
		{
			query: UserDatatableQuerySchema,
			response: {
				200: SuccessResponseSchema(UserPaginationResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
			},
			detail: {
				summary: "Get all users",
				description:
					"Get paginated list of users with filtering by status, name, email, and role",
			},
		},
	)

	// ============================================
	// GET USER BY ID
	// ============================================
	.get(
		"/:id",
		async ({ params, set }) => {
			const user = await UserService.findById(params.id);

			set.status = 200;
			return ResponseUtils.success(user, "User retrieved successfully");
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			response: {
				200: SuccessResponseSchema(UserResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
			},
			detail: {
				summary: "Get user by ID",
				description: "Get detailed information about a specific user",
			},
		},
	)

	// ============================================
	// CREATE USER
	// ============================================
	.post(
		"/",
		async ({ body, set }) => {
			const user = await UserService.create(body);

			set.status = 201;
			return ResponseUtils.success(user, "User created successfully");
		},
		{
			body: CreateUserSchema,
			response: {
				201: SuccessResponseSchema(UserResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				422: CommonResponseSchemas[422],
			},
			detail: {
				summary: "Create user",
				description: "Create a new user with optional role assignments",
			},
		},
	)

	// ============================================
	// UPDATE USER
	// ============================================
	.patch(
		"/:id",
		async ({ params, body, set }) => {
			await UserService.update(params.id, body);

			// Fetch updated user
			const user = await UserService.findById(params.id);

			set.status = 200;
			return ResponseUtils.success(user, "User updated successfully");
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: UpdateUserSchema,
			response: {
				200: SuccessResponseSchema(UserResponseSchema),
				400: CommonResponseSchemas[400],
				401: CommonResponseSchemas[401],
				404: CommonResponseSchemas[404],
				422: CommonResponseSchemas[422],
			},
			detail: {
				summary: "Update user",
				description: "Update an existing user and their role assignments",
			},
		},
	)

	// ============================================
	// DELETE USER
	// ============================================
	.delete(
		"/:id",
		async ({ params, set }) => {
			await UserService.delete(params.id);

			set.status = 200;
			return ResponseUtils.success(null, "User deleted successfully");
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
				summary: "Delete user",
				description: "Soft delete a user",
			},
		},
	);

import { t } from "elysia";

// Datatable query params
export const UserDatatableQuerySchema = t.Object({
	page: t.Optional(t.Number({ minimum: 1 })),
	perPage: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
	search: t.Optional(t.String()),
	sort: t.Optional(t.String()),
	sortDirection: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
	"filter[status]": t.Optional(t.String()),
	"filter[name]": t.Optional(t.String()),
	"filter[email]": t.Optional(t.String()),
	"filter[role_id]": t.Optional(t.String()),
});

// Create user schema
export const CreateUserSchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 255 }),
	email: t.String({ format: "email", maxLength: 255 }),
	password: t.String({ minLength: 8, maxLength: 255 }),
	status: t.Optional(
		t.Union([
			t.Literal("active"),
			t.Literal("inactive"),
			t.Literal("suspended"),
			t.Literal("blocked"),
		]),
	),
	remark: t.Optional(t.String({ maxLength: 255 })),
	role_ids: t.Optional(t.Array(t.String())),
});

// Update user schema (password optional)
export const UpdateUserSchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 255 }),
	email: t.String({ format: "email", maxLength: 255 }),
	status: t.Optional(
		t.Union([
			t.Literal("active"),
			t.Literal("inactive"),
			t.Literal("suspended"),
			t.Literal("blocked"),
		]),
	),
	remark: t.Optional(t.String({ maxLength: 255 })),
	role_ids: t.Optional(t.Array(t.String())),
});

// Response schemas
export const UserRoleResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
});

export const UserResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String(),
	status: t.Union([
		t.Literal("active"),
		t.Literal("inactive"),
		t.Literal("suspended"),
		t.Literal("blocked"),
	]),
	remark: t.Nullable(t.String()),
	roles: t.Array(UserRoleResponseSchema),
	created_at: t.Date(),
	updated_at: t.Date(),
});

export const UserListItemResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	email: t.String(),
	status: t.Union([
		t.Literal("active"),
		t.Literal("inactive"),
		t.Literal("suspended"),
		t.Literal("blocked"),
	]),
	remark: t.Nullable(t.String()),
	roles: t.Array(t.String()),
	created_at: t.Date(),
	updated_at: t.Date(),
});

export const UserListResponseSchema = t.Array(UserListItemResponseSchema);

export const UserPaginationResponseSchema = t.Object({
	data: UserListResponseSchema,
	meta: t.Object({
		page: t.Number(),
		limit: t.Number(),
		totalCount: t.Number(),
	}),
});

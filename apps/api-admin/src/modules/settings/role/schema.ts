import { t } from "elysia";

// Datatable query params
export const RoleDatatableQuerySchema = t.Object({
	page: t.Optional(t.Number({ minimum: 1 })),
	perPage: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
	search: t.Optional(t.String()),
	sort: t.Optional(t.String()),
	sortDirection: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
	"filter[name]": t.Optional(t.String()),
});

// Create role schema
export const CreateRoleSchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 100 }),
	permission_ids: t.Optional(t.Array(t.String())),
});

// Update role schema
export const UpdateRoleSchema = t.Object({
	name: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
	permission_ids: t.Optional(t.Array(t.String())),
});

// Assign permissions schema
export const AssignPermissionsSchema = t.Object({
	permission_ids: t.Array(t.String()),
});

// Response schemas
export const RoleResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	permissions: t.Array(
		t.Object({
			id: t.String(),
			name: t.String(),
			group: t.String(),
		}),
	),
	created_at: t.Date(),
	updated_at: t.Date(),
});

export const RoleWithPermissionsResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	permissions: t.Array(
		t.Object({
			id: t.String(),
			name: t.String(),
			group: t.String(),
			assigned: t.Boolean(),
		}),
	),
	created_at: t.Date(),
	updated_at: t.Date(),
});

export const RoleListItemResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	permissions_count: t.Number(),
	created_at: t.Date(),
	updated_at: t.Date(),
});

export const RoleListResponseSchema = t.Array(RoleListItemResponseSchema);

export const RolePaginationResponseSchema = t.Object({
	data: RoleListResponseSchema,
	meta: t.Object({
		page: t.Number(),
		limit: t.Number(),
		totalCount: t.Number(),
	}),
});

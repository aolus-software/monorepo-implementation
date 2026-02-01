import { t } from "elysia";

// Datatable query params
export const PermissionDatatableQuerySchema = t.Object({
	page: t.Optional(t.Number({ minimum: 1 })),
	perPage: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
	search: t.Optional(t.String()),
	sort: t.Optional(t.String()),
	sortDirection: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
	"filter[group]": t.Optional(t.String()),
	"filter[name]": t.Optional(t.String()),
});

// Create permission schema
export const CreatePermissionSchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 255 }),
	group: t.String({ minLength: 1, maxLength: 100 }),
});

// Create bulk permissions schema
export const CreateBulkPermissionSchema = t.Object({
	group: t.String({ minLength: 1, maxLength: 100 }),
	names: t.Array(t.String({ minLength: 1 }), { minItems: 1 }),
});

// Update permission schema
export const UpdatePermissionSchema = t.Object({
	name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
	group: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
});

// Response schemas
export const PermissionResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	group: t.String(),
	created_at: t.Date(),
	updated_at: t.Date(),
});

export const PermissionListResponseSchema = t.Array(PermissionResponseSchema);

export const PermissionPaginationResponseSchema = t.Object({
	data: PermissionListResponseSchema,
	meta: t.Object({
		page: t.Number(),
		limit: t.Number(),
		totalCount: t.Number(),
	}),
});

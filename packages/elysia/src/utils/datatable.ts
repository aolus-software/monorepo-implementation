import type { DatatableType, SortDirection } from "@repo/types";
import { defaultSort, paginationLength } from "@repo/types";
import { t } from "elysia";

// Define the query type that includes filter parameters
type QueryWithFilters = Record<string, string | number | boolean | undefined>;

export const DatatableQueryParams = t.Object({
	page: t.Number({
		default: 1,
	}),
	perPage: t.Number({
		default: paginationLength,
	}),
	search: t.Optional(t.String()),
	sort: t.Optional(
		t.String({
			default: "created_at",
		}),
	),
	sortDirection: t.Union([t.Literal("asc"), t.Literal("desc")], {
		default: "asc",
	}),
	filter: t.Optional(
		t.Record(t.String(), t.Union([t.String(), t.Boolean(), t.String()])),
	),
});

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class DatatableUtils {
	static parseFilter<T>(query: QueryWithFilters): DatatableType<T> {
		const page: number = typeof query["page"] === "number" ? query["page"] : 1;
		const perPage: number =
			typeof query["perPage"] === "number"
				? query["perPage"]
				: paginationLength;
		const search: string | undefined =
			typeof query["search"] === "string" ? query["search"] : undefined;
		const orderBy: string =
			typeof query["sort"] === "string" ? query["sort"] : defaultSort;
		const orderDirection: SortDirection =
			query["sortDirection"] === "asc" || query["sortDirection"] === "desc"
				? query["sortDirection"]
				: "desc";

		// Parse filter parameters
		const filter: Record<string, boolean | string | Date> = {};

		for (const key in query) {
			if (key.startsWith("filter[")) {
				const filterKey = key.slice(7, -1);
				const value = query[key] as string | boolean | undefined;

				// Type guard for the value
				if (typeof value === "string") {
					if (value === "true") {
						filter[filterKey] = true;
					} else if (value === "false") {
						filter[filterKey] = false;
					} else if (!isNaN(Date.parse(value))) {
						filter[filterKey] = new Date(value);
					} else {
						filter[filterKey] = value;
					}
				}
			}
		}

		return {
			page,
			perPage,
			search,
			sort: orderBy,
			sortDirection: orderDirection,
			filter: filter as Partial<T>,
		};
	}
}

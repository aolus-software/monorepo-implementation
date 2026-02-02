import type { SortDirection } from "./sort-direction";

export interface DatatableType<T> {
	page: number;
	perPage: number;
	search?: string;
	sort?: string;
	sortDirection: SortDirection;
	filter?: Partial<T>;
}

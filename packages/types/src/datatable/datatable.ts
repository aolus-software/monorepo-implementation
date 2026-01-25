import { SortDirection } from "./sort-direction";

export type DatatableType = {
	page: number;
	perPage: number;
	search?: string;
	sort?: string;
	sortDirection: SortDirection;
	filter?: Record<string, boolean | string | Date>;
};

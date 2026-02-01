import { SortDirection } from "./sort-direction";

export type DatatableType<T> = {
	page: number;
	perPage: number;
	search?: string;
	sort?: string;
	sortDirection: SortDirection;
	filter?: Partial<T>;
};

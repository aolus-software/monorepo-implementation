export interface PaginationResponse<T> {
	data: T[];
	meta: {
		page: number;
		limit: number;
		totalCount: number;
	};
}

export interface PaginationKeySetResponse<T> {
	data: T[];
	meta: {
		page: number;
		limit: number;
		totalCount: number;
		nextCursor: string | null;
		previousCursor: string | null;
	};
}

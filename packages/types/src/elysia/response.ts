// ============================================
// RESPONSE TYPES
// ============================================

export type SuccessResponse<T> = {
	status: number;
	success: true;
	message: string;
	data: T;
};

export type ErrorResponse = {
	status: number;
	success: false;
	message: string;
	data: null;
};

export type ValidationErrorResponse = {
	status: number;
	success: false;
	message: string;
	errors: Array<{
		field: string;
		message: string;
	}>;
};

export type PaginatedResponse<T> = {
	status: number;
	success: true;
	message: string;
	data: {
		data: T[];
		meta: {
			page: number;
			limit: number;
			totalCount: number;
		};
	};
};

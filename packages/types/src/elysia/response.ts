// ============================================
// RESPONSE TYPES
// ============================================

export interface SuccessResponse<T> {
	[key: string]: unknown;
	status: number;
	success: true;
	message: string;
	data: T;
}

export interface ErrorResponse {
	[key: string]: unknown;
	status: number;
	success: false;
	message: string;
	data: null;
}

export interface ValidationErrorResponse {
	[key: string]: unknown;
	status: number;
	success: false;
	message: string;
	errors: {
		field: string;
		message: string;
	}[];
}

export interface PaginatedResponse<T> {
	[key: string]: unknown;
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
}

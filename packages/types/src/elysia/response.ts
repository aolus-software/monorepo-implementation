// ============================================
// RESPONSE TYPES
// ============================================

export interface SuccessResponse<T> {
	status: number;
	success: true;
	message: string;
	data: T;
}

export interface ErrorResponse {
	status: number;
	success: false;
	message: string;
	data: null;
}

export interface ValidationErrorResponse {
	status: number;
	success: false;
	message: string;
	errors: {
		field: string;
		message: string;
	}[];
}

export interface PaginatedResponse<T> {
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

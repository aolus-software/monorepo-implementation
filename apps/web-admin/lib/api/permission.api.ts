import type {
	PaginatedResponse,
	PermissionBulkCreate,
	PermissionCreate,
	PermissionDetail,
	PermissionList,
	SuccessResponse,
} from "@repo/types";

import { apiClient } from "./client";

export interface PermissionListParams {
	page?: number;
	perPage?: number;
	search?: string;
}

export interface PermissionUpdatePayload {
	name?: string;
	group?: string;
}

export async function getPermissionsApi(
	params: PermissionListParams,
): Promise<PaginatedResponse<PermissionList>> {
	const response = await apiClient.get<PaginatedResponse<PermissionList>>(
		"/permissions",
		{ params },
	);
	return response.data;
}

export async function getPermissionApi(
	id: string,
): Promise<SuccessResponse<PermissionDetail>> {
	const response = await apiClient.get<SuccessResponse<PermissionDetail>>(
		`/permissions/${id}`,
	);
	return response.data;
}

export async function createPermissionApi(
	data: PermissionCreate,
): Promise<SuccessResponse<PermissionDetail>> {
	const response = await apiClient.post<SuccessResponse<PermissionDetail>>(
		"/permissions",
		data,
	);
	return response.data;
}

export async function createPermissionsBulkApi(
	data: PermissionBulkCreate,
): Promise<SuccessResponse<PermissionDetail[]>> {
	const response = await apiClient.post<SuccessResponse<PermissionDetail[]>>(
		"/permissions/bulk",
		data,
	);
	return response.data;
}

export async function updatePermissionApi(
	id: string,
	data: PermissionUpdatePayload,
): Promise<SuccessResponse<PermissionDetail>> {
	const response = await apiClient.put<SuccessResponse<PermissionDetail>>(
		`/permissions/${id}`,
		data,
	);
	return response.data;
}

export async function deletePermissionApi(
	id: string,
): Promise<SuccessResponse<null>> {
	const response = await apiClient.delete<SuccessResponse<null>>(
		`/permissions/${id}`,
	);
	return response.data;
}

import type {
	PaginatedResponse,
	RoleCreate,
	RoleDetail,
	RoleList,
	RoleUpdate,
	RoleWithPermissions,
	SuccessResponse,
} from "@repo/types";

import { apiClient } from "./client";

export interface RoleListParams {
	page?: number;
	perPage?: number;
	search?: string;
}

export async function getRolesApi(
	params: RoleListParams,
): Promise<PaginatedResponse<RoleList>> {
	const response = await apiClient.get<PaginatedResponse<RoleList>>("/roles", {
		params,
	});
	return response.data;
}

export async function getRoleApi(
	id: string,
): Promise<SuccessResponse<RoleDetail>> {
	const response = await apiClient.get<SuccessResponse<RoleDetail>>(
		`/roles/${id}`,
	);
	return response.data;
}

export async function getRoleWithPermissionsApi(
	id: string,
): Promise<SuccessResponse<RoleWithPermissions>> {
	const response = await apiClient.get<SuccessResponse<RoleWithPermissions>>(
		`/roles/${id}/permissions`,
	);
	return response.data;
}

export async function createRoleApi(
	data: RoleCreate,
): Promise<SuccessResponse<RoleDetail>> {
	const response = await apiClient.post<SuccessResponse<RoleDetail>>(
		"/roles",
		data,
	);
	return response.data;
}

export async function updateRoleApi(
	id: string,
	data: RoleUpdate,
): Promise<SuccessResponse<RoleDetail>> {
	const response = await apiClient.put<SuccessResponse<RoleDetail>>(
		`/roles/${id}`,
		data,
	);
	return response.data;
}

export async function deleteRoleApi(
	id: string,
): Promise<SuccessResponse<null>> {
	const response = await apiClient.delete<SuccessResponse<null>>(
		`/roles/${id}`,
	);
	return response.data;
}

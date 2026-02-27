import type {
	PaginatedResponse,
	SuccessResponse,
	UserCreate,
	UserDetail,
	UserList,
} from "@repo/types";

import { apiClient } from "./client";

export interface UserUpdatePayload {
	name?: string;
	email?: string;
	status?: string;
	remark?: string;
	role_ids?: string[];
}

export interface UserListParams {
	page?: number;
	perPage?: number;
	search?: string;
}

export async function getUsersApi(
	params: UserListParams,
): Promise<PaginatedResponse<UserList>> {
	const response = await apiClient.get<PaginatedResponse<UserList>>("/users", {
		params,
	});
	return response.data;
}

export async function getUserApi(
	id: string,
): Promise<SuccessResponse<UserDetail>> {
	const response = await apiClient.get<SuccessResponse<UserDetail>>(
		`/users/${id}`,
	);
	return response.data;
}

export async function createUserApi(
	data: UserCreate,
): Promise<SuccessResponse<UserDetail>> {
	const response = await apiClient.post<SuccessResponse<UserDetail>>(
		"/users",
		data,
	);
	return response.data;
}

export async function updateUserApi(
	id: string,
	data: UserUpdatePayload,
): Promise<SuccessResponse<UserDetail>> {
	const response = await apiClient.put<SuccessResponse<UserDetail>>(
		`/users/${id}`,
		data,
	);
	return response.data;
}

export async function deleteUserApi(
	id: string,
): Promise<SuccessResponse<null>> {
	const response = await apiClient.delete<SuccessResponse<null>>(
		`/users/${id}`,
	);
	return response.data;
}

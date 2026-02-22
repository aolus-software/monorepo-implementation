import type { SuccessResponse } from "@repo/types";

import { apiClient } from "./client";
import type { LoginApiResponse, LoginFormValues } from "../types/auth";

export async function loginApi(
	credentials: LoginFormValues,
): Promise<SuccessResponse<LoginApiResponse>> {
	const response = await apiClient.post<SuccessResponse<LoginApiResponse>>(
		"/auth/login",
		credentials,
	);
	return response.data;
}

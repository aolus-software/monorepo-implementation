import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { ErrorResponse, PaginatedResponse, UserList } from "@repo/types";

import { getUsersApi } from "../../api/user.api";
import type { UserListParams } from "../../api/user.api";

export function useUsersQuery(
	params: UserListParams,
): UseQueryResult<PaginatedResponse<UserList>, AxiosError<ErrorResponse>> {
	return useQuery({
		queryKey: ["users", params],
		queryFn: () => getUsersApi(params),
	});
}

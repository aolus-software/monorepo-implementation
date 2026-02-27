import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { ErrorResponse, PaginatedResponse, RoleList } from "@repo/types";

import { getRolesApi } from "../../api/role.api";
import type { RoleListParams } from "../../api/role.api";

export function useRolesQuery(
	params: RoleListParams,
): UseQueryResult<PaginatedResponse<RoleList>, AxiosError<ErrorResponse>> {
	return useQuery({
		queryKey: ["roles", params],
		queryFn: () => getRolesApi(params),
	});
}

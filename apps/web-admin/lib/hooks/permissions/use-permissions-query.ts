import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type {
	ErrorResponse,
	PaginatedResponse,
	PermissionList,
} from "@repo/types";

import { getPermissionsApi } from "../../api/permission.api";
import type { PermissionListParams } from "../../api/permission.api";

export function usePermissionsQuery(
	params: PermissionListParams,
): UseQueryResult<
	PaginatedResponse<PermissionList>,
	AxiosError<ErrorResponse>
> {
	return useQuery({
		queryKey: ["permissions", params],
		queryFn: () => getPermissionsApi(params),
	});
}

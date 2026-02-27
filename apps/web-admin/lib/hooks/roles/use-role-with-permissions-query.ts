import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type {
	ErrorResponse,
	RoleWithPermissions,
	SuccessResponse,
} from "@repo/types";

import { getRoleWithPermissionsApi } from "../../api/role.api";

export function useRoleWithPermissionsQuery(
	id: string | null,
): UseQueryResult<
	SuccessResponse<RoleWithPermissions>,
	AxiosError<ErrorResponse>
> {
	return useQuery({
		queryKey: ["roles", id, "permissions"],
		queryFn: () => getRoleWithPermissionsApi(id as string),
		enabled: id !== null,
	});
}

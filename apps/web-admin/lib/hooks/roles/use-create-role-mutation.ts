import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	RoleCreate,
	RoleDetail,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { createRoleApi } from "../../api/role.api";

export type RoleMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useCreateRoleMutation(): ReturnType<
	typeof useMutation<SuccessResponse<RoleDetail>, RoleMutationError, RoleCreate>
> {
	const queryClient = useQueryClient();

	return useMutation<
		SuccessResponse<RoleDetail>,
		RoleMutationError,
		RoleCreate
	>({
		mutationFn: createRoleApi,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Role created successfully");
		},
		onError: (error) => {
			const message = error.response?.data?.message ?? "Failed to create role";
			toast.error(message);
		},
	});
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	RoleDetail,
	RoleUpdate,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { updateRoleApi } from "../../api/role.api";

export type RoleMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useUpdateRoleMutation(): ReturnType<
	typeof useMutation<
		SuccessResponse<RoleDetail>,
		RoleMutationError,
		{ id: string; data: RoleUpdate }
	>
> {
	const queryClient = useQueryClient();

	return useMutation<
		SuccessResponse<RoleDetail>,
		RoleMutationError,
		{ id: string; data: RoleUpdate }
	>({
		mutationFn: ({ id, data }) => updateRoleApi(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Role updated successfully");
		},
		onError: (error) => {
			const message = error.response?.data?.message ?? "Failed to update role";
			toast.error(message);
		},
	});
}

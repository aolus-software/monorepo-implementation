import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { deleteRoleApi } from "../../api/role.api";

export type RoleMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useDeleteRoleMutation(): ReturnType<
	typeof useMutation<SuccessResponse<null>, RoleMutationError, string>
> {
	const queryClient = useQueryClient();

	return useMutation<SuccessResponse<null>, RoleMutationError, string>({
		mutationFn: deleteRoleApi,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["roles"] });
			toast.success("Role deleted successfully");
		},
		onError: (error) => {
			const message = error.response?.data?.message ?? "Failed to delete role";
			toast.error(message);
		},
	});
}

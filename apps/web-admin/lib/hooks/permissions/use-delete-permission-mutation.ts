import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { deletePermissionApi } from "../../api/permission.api";

export type PermissionMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useDeletePermissionMutation(): ReturnType<
	typeof useMutation<SuccessResponse<null>, PermissionMutationError, string>
> {
	const queryClient = useQueryClient();

	return useMutation<SuccessResponse<null>, PermissionMutationError, string>({
		mutationFn: deletePermissionApi,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["permissions"] });
			toast.success("Permission deleted successfully");
		},
		onError: (error) => {
			const message =
				error.response?.data?.message ?? "Failed to delete permission";
			toast.error(message);
		},
	});
}

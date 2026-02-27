import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	PermissionCreate,
	PermissionDetail,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { createPermissionApi } from "../../api/permission.api";

export type PermissionMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useCreatePermissionMutation(): ReturnType<
	typeof useMutation<
		SuccessResponse<PermissionDetail>,
		PermissionMutationError,
		PermissionCreate
	>
> {
	const queryClient = useQueryClient();

	return useMutation<
		SuccessResponse<PermissionDetail>,
		PermissionMutationError,
		PermissionCreate
	>({
		mutationFn: createPermissionApi,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["permissions"] });
			toast.success("Permission created successfully");
		},
		onError: (error) => {
			const message =
				error.response?.data?.message ?? "Failed to create permission";
			toast.error(message);
		},
	});
}

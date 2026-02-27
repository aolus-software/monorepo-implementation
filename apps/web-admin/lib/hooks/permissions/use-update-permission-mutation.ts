import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	PermissionDetail,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { updatePermissionApi } from "../../api/permission.api";
import type { PermissionUpdatePayload } from "../../api/permission.api";

export type PermissionMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useUpdatePermissionMutation(): ReturnType<
	typeof useMutation<
		SuccessResponse<PermissionDetail>,
		PermissionMutationError,
		{ id: string; data: PermissionUpdatePayload }
	>
> {
	const queryClient = useQueryClient();

	return useMutation<
		SuccessResponse<PermissionDetail>,
		PermissionMutationError,
		{ id: string; data: PermissionUpdatePayload }
	>({
		mutationFn: ({ id, data }) => updatePermissionApi(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["permissions"] });
			toast.success("Permission updated successfully");
		},
		onError: (error) => {
			const message =
				error.response?.data?.message ?? "Failed to update permission";
			toast.error(message);
		},
	});
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	PermissionBulkCreate,
	PermissionDetail,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { createPermissionsBulkApi } from "../../api/permission.api";

export type PermissionMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useCreatePermissionsBulkMutation(): ReturnType<
	typeof useMutation<
		SuccessResponse<PermissionDetail[]>,
		PermissionMutationError,
		PermissionBulkCreate
	>
> {
	const queryClient = useQueryClient();

	return useMutation<
		SuccessResponse<PermissionDetail[]>,
		PermissionMutationError,
		PermissionBulkCreate
	>({
		mutationFn: createPermissionsBulkApi,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["permissions"] });
			toast.success("Permissions created successfully");
		},
		onError: (error) => {
			const message =
				error.response?.data?.message ?? "Failed to create permissions";
			toast.error(message);
		},
	});
}

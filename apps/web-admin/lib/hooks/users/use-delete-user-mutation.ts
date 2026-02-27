import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { deleteUserApi } from "../../api/user.api";

export type UserMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useDeleteUserMutation(): ReturnType<
	typeof useMutation<SuccessResponse<null>, UserMutationError, string>
> {
	const queryClient = useQueryClient();

	return useMutation<SuccessResponse<null>, UserMutationError, string>({
		mutationFn: deleteUserApi,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User deleted successfully");
		},
		onError: (error) => {
			const message = error.response?.data?.message ?? "Failed to delete user";
			toast.error(message);
		},
	});
}

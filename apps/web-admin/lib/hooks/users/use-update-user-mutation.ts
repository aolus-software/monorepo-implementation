import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	SuccessResponse,
	UserDetail,
	ValidationErrorResponse,
} from "@repo/types";

import { updateUserApi } from "../../api/user.api";
import type { UserUpdatePayload } from "../../api/user.api";

export type UserMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useUpdateUserMutation(): ReturnType<
	typeof useMutation<
		SuccessResponse<UserDetail>,
		UserMutationError,
		{ id: string; data: UserUpdatePayload }
	>
> {
	const queryClient = useQueryClient();

	return useMutation<
		SuccessResponse<UserDetail>,
		UserMutationError,
		{ id: string; data: UserUpdatePayload }
	>({
		mutationFn: ({ id, data }) => updateUserApi(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User updated successfully");
		},
		onError: (error) => {
			const message = error.response?.data?.message ?? "Failed to update user";
			toast.error(message);
		},
	});
}

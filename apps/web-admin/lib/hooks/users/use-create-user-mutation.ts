import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";

import type {
	ErrorResponse,
	SuccessResponse,
	UserCreate,
	UserDetail,
	ValidationErrorResponse,
} from "@repo/types";

import { createUserApi } from "../../api/user.api";

export type UserMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useCreateUserMutation(): ReturnType<
	typeof useMutation<SuccessResponse<UserDetail>, UserMutationError, UserCreate>
> {
	const queryClient = useQueryClient();

	return useMutation<
		SuccessResponse<UserDetail>,
		UserMutationError,
		UserCreate
	>({
		mutationFn: createUserApi,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("User created successfully");
		},
		onError: (error) => {
			const message = error.response?.data?.message ?? "Failed to create user";
			toast.error(message);
		},
	});
}

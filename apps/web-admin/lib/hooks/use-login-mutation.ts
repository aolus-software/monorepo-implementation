import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type {
	ErrorResponse,
	SuccessResponse,
	ValidationErrorResponse,
} from "@repo/types";

import { loginApi } from "../api/auth.api";
import type { LoginApiResponse, LoginFormValues } from "../types/auth";

export type LoginMutationError = AxiosError<
	ErrorResponse | ValidationErrorResponse
>;

export function useLoginMutation(): ReturnType<
	typeof useMutation<
		SuccessResponse<LoginApiResponse>,
		LoginMutationError,
		LoginFormValues
	>
> {
	return useMutation<
		SuccessResponse<LoginApiResponse>,
		LoginMutationError,
		LoginFormValues
	>({
		mutationFn: loginApi,
	});
}

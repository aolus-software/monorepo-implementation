"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { ErrorResponse, ValidationErrorResponse } from "@repo/types";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Label,
} from "@repo/ui";
import type { AxiosError } from "axios";

import { useAuth } from "../context/auth-context";
import { useLoginMutation } from "../hooks/use-login-mutation";
import type { LoginFormValues } from "../types/auth";

const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

function extractApiErrorMessage(
	error: AxiosError<ErrorResponse | ValidationErrorResponse>,
): string {
	const data = error.response?.data;
	if (data === undefined || data === null) {
		return "An unexpected error occurred. Please try again.";
	}
	if (
		"errors" in data &&
		Array.isArray(data.errors) &&
		data.errors.length > 0
	) {
		const firstError = data.errors[0];
		return firstError?.message ?? data.message;
	}
	return data.message;
}

export function LoginForm(): React.JSX.Element {
	const router = useRouter();
	const { login } = useAuth();
	const { mutate, isPending, error: apiError } = useLoginMutation();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = React.useCallback(
		(values: LoginFormValues): void => {
			mutate(values, {
				onSuccess: (response) => {
					login(response.data.user, response.data.accessToken);
					router.push("/dashboard");
				},
			});
		},
		[mutate, login, router],
	);

	const apiErrorMessage =
		apiError !== null ? extractApiErrorMessage(apiError) : null;

	return (
		<Card className="w-full max-w-sm">
			<CardHeader className="space-y-1">
				<CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
				<CardDescription>
					Enter your credentials to access the admin panel
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={handleSubmit(onSubmit)}
					className="space-y-4"
					noValidate
				>
					{apiErrorMessage !== null && (
						<div
							role="alert"
							className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
						>
							{apiErrorMessage}
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							placeholder="admin@example.com"
							autoComplete="email"
							disabled={isPending}
							aria-invalid={errors.email !== undefined}
							{...register("email")}
						/>
						{errors.email?.message !== undefined && (
							<p className="text-xs text-destructive">{errors.email.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Password</Label>
						<Input
							id="password"
							type="password"
							autoComplete="current-password"
							disabled={isPending}
							aria-invalid={errors.password !== undefined}
							{...register("password")}
						/>
						{errors.password?.message !== undefined && (
							<p className="text-xs text-destructive">
								{errors.password.message}
							</p>
						)}
					</div>

					<Button type="submit" className="w-full" disabled={isPending}>
						{isPending ? "Signing in..." : "Sign in"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}

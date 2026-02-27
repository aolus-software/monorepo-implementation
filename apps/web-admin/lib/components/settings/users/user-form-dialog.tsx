"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { RoleList, UserDetail } from "@repo/types";
import {
	Button,
	Checkbox,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Textarea,
} from "@repo/ui";

import { useCreateUserMutation } from "../../../hooks/users/use-create-user-mutation";
import { useUpdateUserMutation } from "../../../hooks/users/use-update-user-mutation";

const createSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	status: z.enum(["active", "inactive", "suspended", "blocked"]),
	remark: z.string().optional(),
	role_ids: z.array(z.string()),
});

const editSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	status: z.enum(["active", "inactive", "suspended", "blocked"]),
	remark: z.string().optional(),
	role_ids: z.array(z.string()),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

interface UserFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: UserDetail | null;
	roles: RoleList[];
}

export function UserFormDialog({
	open,
	onOpenChange,
	user,
	roles,
}: UserFormDialogProps): React.JSX.Element {
	const isEdit = user !== null && user !== undefined;
	const createMutation = useCreateUserMutation();
	const updateMutation = useUpdateUserMutation();

	const createForm = useForm<CreateFormValues>({
		resolver: zodResolver(createSchema),
		defaultValues: {
			name: "",
			email: "",
			password: "",
			status: "active",
			remark: "",
			role_ids: [],
		},
	});

	const editForm = useForm<EditFormValues>({
		resolver: zodResolver(editSchema),
		defaultValues: {
			name: user?.name ?? "",
			email: user?.email ?? "",
			status: user?.status ?? "active",
			remark: user?.remark ?? "",
			role_ids: user?.roles.map((r) => r.id) ?? [],
		},
	});

	// Reset forms when dialog opens or user changes
	React.useEffect(() => {
		if (open) {
			if (isEdit && user) {
				editForm.reset({
					name: user.name,
					email: user.email,
					status: user.status,
					remark: user.remark ?? "",
					role_ids: user.roles.map((r) => r.id),
				});
			} else {
				createForm.reset({
					name: "",
					email: "",
					password: "",
					status: "active",
					remark: "",
					role_ids: [],
				});
			}
		}
	}, [open, user, isEdit, createForm, editForm]);

	const isPending = createMutation.isPending || updateMutation.isPending;
	const apiError = isEdit
		? updateMutation.error?.response?.data?.message
		: createMutation.error?.response?.data?.message;

	function handleCreateSubmit(values: CreateFormValues): void {
		createMutation.mutate(values, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	}

	function handleEditSubmit(values: EditFormValues): void {
		if (!user) return;
		updateMutation.mutate(
			{ id: user.id, data: values },
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			},
		);
	}

	// Role checkbox toggle helper
	function toggleRole(
		roleId: string,
		currentIds: string[],
		onChange: (ids: string[]) => void,
	): void {
		if (currentIds.includes(roleId)) {
			onChange(currentIds.filter((id) => id !== roleId));
		} else {
			onChange([...currentIds, roleId]);
		}
	}

	const title = isEdit ? "Edit User" : "Create User";
	const description = isEdit
		? "Update user details and role assignments."
		: "Fill in the details to create a new user.";

	if (isEdit) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>
					<form onSubmit={editForm.handleSubmit(handleEditSubmit)}>
						<div className="space-y-4 py-2">
							<div className="space-y-1">
								<Label htmlFor="edit-name">Name</Label>
								<Input id="edit-name" {...editForm.register("name")} />
								{editForm.formState.errors.name && (
									<p className="text-xs text-destructive">
										{editForm.formState.errors.name.message}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<Label htmlFor="edit-email">Email</Label>
								<Input
									id="edit-email"
									type="email"
									{...editForm.register("email")}
								/>
								{editForm.formState.errors.email && (
									<p className="text-xs text-destructive">
										{editForm.formState.errors.email.message}
									</p>
								)}
							</div>
							<div className="space-y-1">
								<Label htmlFor="edit-status">Status</Label>
								<Select
									value={editForm.watch("status")}
									onValueChange={(v) => {
										editForm.setValue(
											"status",
											v as "active" | "inactive" | "suspended" | "blocked",
										);
									}}
								>
									<SelectTrigger id="edit-status">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="active">Active</SelectItem>
										<SelectItem value="inactive">Inactive</SelectItem>
										<SelectItem value="suspended">Suspended</SelectItem>
										<SelectItem value="blocked">Blocked</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1">
								<Label htmlFor="edit-remark">Remark</Label>
								<Textarea
									id="edit-remark"
									placeholder="Optional remark..."
									{...editForm.register("remark")}
								/>
							</div>
							<div className="space-y-2">
								<Label>Roles</Label>
								<div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-2">
									{roles.map((role) => {
										const currentIds = editForm.watch("role_ids");
										return (
											<div key={role.id} className="flex items-center gap-2">
												<Checkbox
													id={`edit-role-${role.id}`}
													checked={currentIds.includes(role.id)}
													onCheckedChange={() => {
														toggleRole(role.id, currentIds, (ids) => {
															editForm.setValue("role_ids", ids);
														});
													}}
												/>
												<Label
													htmlFor={`edit-role-${role.id}`}
													className="cursor-pointer font-normal"
												>
													{role.name}
												</Label>
											</div>
										);
									})}
									{roles.length === 0 && (
										<p className="text-xs text-muted-foreground">
											No roles available.
										</p>
									)}
								</div>
							</div>
						</div>
						{apiError && (
							<p className="mt-2 text-sm text-destructive">{apiError}</p>
						)}
						<DialogFooter className="mt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									onOpenChange(false);
								}}
								disabled={isPending}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<form onSubmit={createForm.handleSubmit(handleCreateSubmit)}>
					<div className="space-y-4 py-2">
						<div className="space-y-1">
							<Label htmlFor="create-name">Name</Label>
							<Input id="create-name" {...createForm.register("name")} />
							{createForm.formState.errors.name && (
								<p className="text-xs text-destructive">
									{createForm.formState.errors.name.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label htmlFor="create-email">Email</Label>
							<Input
								id="create-email"
								type="email"
								{...createForm.register("email")}
							/>
							{createForm.formState.errors.email && (
								<p className="text-xs text-destructive">
									{createForm.formState.errors.email.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label htmlFor="create-password">Password</Label>
							<Input
								id="create-password"
								type="password"
								{...createForm.register("password")}
							/>
							{createForm.formState.errors.password && (
								<p className="text-xs text-destructive">
									{createForm.formState.errors.password.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label htmlFor="create-status">Status</Label>
							<Select
								value={createForm.watch("status")}
								onValueChange={(v) => {
									createForm.setValue(
										"status",
										v as "active" | "inactive" | "suspended" | "blocked",
									);
								}}
							>
								<SelectTrigger id="create-status">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="suspended">Suspended</SelectItem>
									<SelectItem value="blocked">Blocked</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label htmlFor="create-remark">Remark</Label>
							<Textarea
								id="create-remark"
								placeholder="Optional remark..."
								{...createForm.register("remark")}
							/>
						</div>
						<div className="space-y-2">
							<Label>Roles</Label>
							<div className="max-h-40 overflow-y-auto rounded-md border p-2 space-y-2">
								{roles.map((role) => {
									const currentIds = createForm.watch("role_ids");
									return (
										<div key={role.id} className="flex items-center gap-2">
											<Checkbox
												id={`create-role-${role.id}`}
												checked={currentIds.includes(role.id)}
												onCheckedChange={() => {
													toggleRole(role.id, currentIds, (ids) => {
														createForm.setValue("role_ids", ids);
													});
												}}
											/>
											<Label
												htmlFor={`create-role-${role.id}`}
												className="cursor-pointer font-normal"
											>
												{role.name}
											</Label>
										</div>
									);
								})}
								{roles.length === 0 && (
									<p className="text-xs text-muted-foreground">
										No roles available.
									</p>
								)}
							</div>
						</div>
					</div>
					{apiError && (
						<p className="mt-2 text-sm text-destructive">{apiError}</p>
					)}
					<DialogFooter className="mt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								onOpenChange(false);
							}}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PermissionList } from "@repo/types";
import {
	Button,
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Label,
} from "@repo/ui";

import { useCreatePermissionMutation } from "../../../hooks/permissions/use-create-permission-mutation";
import { useUpdatePermissionMutation } from "../../../hooks/permissions/use-update-permission-mutation";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	group: z.string().min(1, "Group is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface PermissionFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	permission?: PermissionList | null;
}

export function PermissionFormDialog({
	open,
	onOpenChange,
	permission,
}: PermissionFormDialogProps): React.JSX.Element {
	const isEdit = permission !== null && permission !== undefined;
	const createMutation = useCreatePermissionMutation();
	const updateMutation = useUpdatePermissionMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "", group: "" },
	});

	React.useEffect(() => {
		if (open) {
			form.reset({
				name: permission?.name ?? "",
				group: permission?.group ?? "",
			});
		}
	}, [open, permission, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;
	const apiError = isEdit
		? updateMutation.error?.response?.data?.message
		: createMutation.error?.response?.data?.message;

	function handleSubmit(values: FormValues): void {
		if (isEdit && permission) {
			updateMutation.mutate(
				{ id: permission.id, data: values },
				{
					onSuccess: () => {
						onOpenChange(false);
					},
				},
			);
		} else {
			createMutation.mutate(values, {
				onSuccess: () => {
					onOpenChange(false);
				},
			});
		}
	}

	const title = isEdit ? "Edit Permission" : "Create Permission";
	const description = isEdit
		? "Update permission name and group."
		: "Fill in the details to create a new permission.";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<div className="space-y-4 py-2">
						<div className="space-y-1">
							<Label htmlFor="perm-name">Name</Label>
							<Input id="perm-name" {...form.register("name")} />
							{form.formState.errors.name && (
								<p className="text-xs text-destructive">
									{form.formState.errors.name.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label htmlFor="perm-group">Group</Label>
							<Input
								id="perm-group"
								placeholder="e.g. users"
								{...form.register("group")}
							/>
							{form.formState.errors.group && (
								<p className="text-xs text-destructive">
									{form.formState.errors.group.message}
								</p>
							)}
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
							{isPending ? "Saving..." : isEdit ? "Save" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

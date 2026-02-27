"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
	Textarea,
} from "@repo/ui";

import { useCreatePermissionsBulkMutation } from "../../../hooks/permissions/use-create-permissions-bulk-mutation";

const formSchema = z.object({
	group: z.string().min(1, "Group is required"),
	names: z.string().min(1, "At least one permission name is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface PermissionBulkCreateDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PermissionBulkCreateDialog({
	open,
	onOpenChange,
}: PermissionBulkCreateDialogProps): React.JSX.Element {
	const bulkMutation = useCreatePermissionsBulkMutation();

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { group: "", names: "" },
	});

	React.useEffect(() => {
		if (open) {
			form.reset({ group: "", names: "" });
		}
	}, [open, form]);

	const apiError = bulkMutation.error?.response?.data?.message;

	function handleSubmit(values: FormValues): void {
		const names = values.names
			.split("\n")
			.map((n) => n.trim())
			.filter((n) => n.length > 0);

		bulkMutation.mutate(
			{ group: values.group, names },
			{
				onSuccess: () => {
					onOpenChange(false);
				},
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>Bulk Create Permissions</DialogTitle>
					<DialogDescription>
						Enter a group and one permission name per line.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<div className="space-y-4 py-2">
						<div className="space-y-1">
							<Label htmlFor="bulk-group">Group</Label>
							<Input
								id="bulk-group"
								placeholder="e.g. users"
								{...form.register("group")}
							/>
							{form.formState.errors.group && (
								<p className="text-xs text-destructive">
									{form.formState.errors.group.message}
								</p>
							)}
						</div>
						<div className="space-y-1">
							<Label htmlFor="bulk-names">Permission Names</Label>
							<Textarea
								id="bulk-names"
								rows={6}
								placeholder={"users.read\nusers.write\nusers.delete"}
								{...form.register("names")}
							/>
							<p className="text-xs text-muted-foreground">
								One permission name per line.
							</p>
							{form.formState.errors.names && (
								<p className="text-xs text-destructive">
									{form.formState.errors.names.message}
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
							disabled={bulkMutation.isPending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={bulkMutation.isPending}>
							{bulkMutation.isPending ? "Creating..." : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

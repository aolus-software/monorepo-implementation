"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { PermissionList, RoleList } from "@repo/types";
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
} from "@repo/ui";

import { useRoleWithPermissionsQuery } from "../../../hooks/roles/use-role-with-permissions-query";
import { useCreateRoleMutation } from "../../../hooks/roles/use-create-role-mutation";
import { useUpdateRoleMutation } from "../../../hooks/roles/use-update-role-mutation";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	permission_ids: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

interface RoleFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	role?: RoleList | null;
	permissions: PermissionList[];
}

export function RoleFormDialog({
	open,
	onOpenChange,
	role,
	permissions,
}: RoleFormDialogProps): React.JSX.Element {
	const isEdit = role !== null && role !== undefined;
	const createMutation = useCreateRoleMutation();
	const updateMutation = useUpdateRoleMutation();

	// Fetch role's currently assigned permissions when editing
	const { data: roleWithPerms } = useRoleWithPermissionsQuery(
		isEdit && open ? role.id : null,
	);

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: { name: "", permission_ids: [] },
	});

	// Reset form with pre-filled values when dialog opens
	React.useEffect(() => {
		if (open) {
			if (isEdit && role) {
				form.reset({
					name: role.name,
					permission_ids:
						roleWithPerms?.data.permissions
							.filter((p) => p.assigned)
							.map((p) => p.id) ?? [],
				});
			} else {
				form.reset({ name: "", permission_ids: [] });
			}
		}
	}, [open, role, isEdit, roleWithPerms, form]);

	const isPending = createMutation.isPending || updateMutation.isPending;
	const apiError = isEdit
		? updateMutation.error?.response?.data?.message
		: createMutation.error?.response?.data?.message;

	// Group permissions by their group field
	const grouped = React.useMemo(() => {
		const map = new Map<string, PermissionList[]>();
		for (const perm of permissions) {
			const existing = map.get(perm.group);
			if (existing) {
				existing.push(perm);
			} else {
				map.set(perm.group, [perm]);
			}
		}
		return map;
	}, [permissions]);

	function togglePermission(permId: string): void {
		const current = form.getValues("permission_ids");
		if (current.includes(permId)) {
			form.setValue(
				"permission_ids",
				current.filter((id) => id !== permId),
			);
		} else {
			form.setValue("permission_ids", [...current, permId]);
		}
	}

	function handleSubmit(values: FormValues): void {
		if (isEdit && role) {
			updateMutation.mutate(
				{ id: role.id, data: values },
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

	const title = isEdit ? "Edit Role" : "Create Role";
	const description = isEdit
		? "Update role name and permission assignments."
		: "Fill in details to create a new role.";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(handleSubmit)}>
					<div className="space-y-4 py-2">
						<div className="space-y-1">
							<Label htmlFor="role-name">Name</Label>
							<Input id="role-name" {...form.register("name")} />
							{form.formState.errors.name && (
								<p className="text-xs text-destructive">
									{form.formState.errors.name.message}
								</p>
							)}
						</div>
						<div className="space-y-2">
							<Label>Permissions</Label>
							<div className="max-h-60 overflow-y-auto rounded-md border p-2 space-y-4">
								{grouped.size === 0 ? (
									<p className="text-xs text-muted-foreground">
										No permissions available.
									</p>
								) : (
									Array.from(grouped.entries()).map(([group, perms]) => (
										<div key={group} className="space-y-1">
											<p className="text-xs font-semibold uppercase text-muted-foreground">
												{group}
											</p>
											<div className="space-y-1 pl-2">
												{perms.map((perm) => {
													const currentIds = form.watch("permission_ids");
													return (
														<div
															key={perm.id}
															className="flex items-center gap-2"
														>
															<Checkbox
																id={`perm-${perm.id}`}
																checked={currentIds.includes(perm.id)}
																onCheckedChange={() => {
																	togglePermission(perm.id);
																}}
															/>
															<Label
																htmlFor={`perm-${perm.id}`}
																className="cursor-pointer font-normal text-sm"
															>
																{perm.name}
															</Label>
														</div>
													);
												})}
											</div>
										</div>
									))
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
							{isPending ? "Saving..." : isEdit ? "Save" : "Create"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

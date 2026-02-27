"use client";

import * as React from "react";

import type { RoleList } from "@repo/types";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@repo/ui";

import { useDeleteRoleMutation } from "../../../hooks/roles/use-delete-role-mutation";

interface RoleDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	role: RoleList | null;
}

export function RoleDeleteDialog({
	open,
	onOpenChange,
	role,
}: RoleDeleteDialogProps): React.JSX.Element {
	const deleteMutation = useDeleteRoleMutation();

	function handleConfirm(): void {
		if (!role) return;
		deleteMutation.mutate(role.id, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Role</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete the role{" "}
						<span className="font-semibold">{role?.name}</span>? This action
						cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel disabled={deleteMutation.isPending}>
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						onClick={handleConfirm}
						disabled={deleteMutation.isPending}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

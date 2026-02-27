"use client";

import * as React from "react";

import type { PermissionList } from "@repo/types";
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

import { useDeletePermissionMutation } from "../../../hooks/permissions/use-delete-permission-mutation";

interface PermissionDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	permission: PermissionList | null;
}

export function PermissionDeleteDialog({
	open,
	onOpenChange,
	permission,
}: PermissionDeleteDialogProps): React.JSX.Element {
	const deleteMutation = useDeletePermissionMutation();

	function handleConfirm(): void {
		if (!permission) return;
		deleteMutation.mutate(permission.id, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Permission</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete the permission{" "}
						<span className="font-semibold">{permission?.name}</span>? This
						action cannot be undone.
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

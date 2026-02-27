"use client";

import * as React from "react";

import type { UserList } from "@repo/types";
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

import { useDeleteUserMutation } from "../../../hooks/users/use-delete-user-mutation";

interface UserDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: UserList | null;
}

export function UserDeleteDialog({
	open,
	onOpenChange,
	user,
}: UserDeleteDialogProps): React.JSX.Element {
	const deleteMutation = useDeleteUserMutation();

	function handleConfirm(): void {
		if (!user) return;
		deleteMutation.mutate(user.id, {
			onSuccess: () => {
				onOpenChange(false);
			},
		});
	}

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete User</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete{" "}
						<span className="font-semibold">{user?.name}</span>? This action
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

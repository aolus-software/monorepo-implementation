"use client";

import * as React from "react";

import type { PermissionList } from "@repo/types";
import { Button, Card, CardContent, Input } from "@repo/ui";

import { usePermissionsQuery } from "../../../hooks/permissions/use-permissions-query";
import { PermissionBulkCreateDialog } from "./permission-bulk-create-dialog";
import { PermissionDeleteDialog } from "./permission-delete-dialog";
import { PermissionFormDialog } from "./permission-form-dialog";
import { PermissionsTable } from "./permissions-table";

export function PermissionsPageClient(): React.JSX.Element {
	const [page, setPage] = React.useState(1);
	const [perPage] = React.useState(10);
	const [search, setSearch] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");

	const [createOpen, setCreateOpen] = React.useState(false);
	const [bulkCreateOpen, setBulkCreateOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [selectedPermission, setSelectedPermission] =
		React.useState<PermissionList | null>(null);

	// Debounce search input
	React.useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedSearch(search);
			setPage(1);
		}, 400);
		return () => {
			clearTimeout(timer);
		};
	}, [search]);

	const { data: permissionsData, isLoading } = usePermissionsQuery({
		page,
		perPage,
		search: debouncedSearch || undefined,
	});

	const permissions = permissionsData?.data.data ?? [];
	const totalCount = permissionsData?.data.meta.totalCount ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / perPage));

	function handleEdit(permission: PermissionList): void {
		setSelectedPermission(permission);
		setEditOpen(true);
	}

	function handleDelete(permission: PermissionList): void {
		setSelectedPermission(permission);
		setDeleteOpen(true);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Permissions</h1>
					<p className="text-muted-foreground">
						Manage individual permissions and groups.
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						onClick={() => {
							setBulkCreateOpen(true);
						}}
					>
						Bulk Create
					</Button>
					<Button
						onClick={() => {
							setCreateOpen(true);
						}}
					>
						Add Permission
					</Button>
				</div>
			</div>

			<Card>
				<CardContent className="pt-6 space-y-4">
					<Input
						placeholder="Search permissions..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
						}}
						className="max-w-sm"
					/>

					<PermissionsTable
						data={permissions}
						isLoading={isLoading}
						onEdit={handleEdit}
						onDelete={handleDelete}
					/>

					{/* Pagination */}
					<div className="flex items-center justify-between text-sm text-muted-foreground">
						<span>
							Page {page} of {totalPages} ({totalCount} total)
						</span>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setPage((p) => Math.max(1, p - 1));
								}}
								disabled={page <= 1}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setPage((p) => Math.min(totalPages, p + 1));
								}}
								disabled={page >= totalPages}
							>
								Next
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<PermissionFormDialog open={createOpen} onOpenChange={setCreateOpen} />

			<PermissionFormDialog
				open={editOpen}
				onOpenChange={(open) => {
					setEditOpen(open);
					if (!open) setSelectedPermission(null);
				}}
				permission={selectedPermission}
			/>

			<PermissionBulkCreateDialog
				open={bulkCreateOpen}
				onOpenChange={setBulkCreateOpen}
			/>

			<PermissionDeleteDialog
				open={deleteOpen}
				onOpenChange={(open) => {
					setDeleteOpen(open);
					if (!open) setSelectedPermission(null);
				}}
				permission={selectedPermission}
			/>
		</div>
	);
}

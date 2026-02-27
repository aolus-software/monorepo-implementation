"use client";

import * as React from "react";

import type { RoleList } from "@repo/types";
import { Button, Card, CardContent, Input } from "@repo/ui";

import { usePermissionsQuery } from "../../../hooks/permissions/use-permissions-query";
import { useRolesQuery } from "../../../hooks/roles/use-roles-query";
import { RoleDeleteDialog } from "./role-delete-dialog";
import { RoleFormDialog } from "./role-form-dialog";
import { RolesTable } from "./roles-table";

export function RolesPageClient(): React.JSX.Element {
	const [page, setPage] = React.useState(1);
	const [perPage] = React.useState(10);
	const [search, setSearch] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");

	const [createOpen, setCreateOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [selectedRole, setSelectedRole] = React.useState<RoleList | null>(null);

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

	const { data: rolesData, isLoading } = useRolesQuery({
		page,
		perPage,
		search: debouncedSearch || undefined,
	});

	// Fetch all permissions for the role form
	const { data: permissionsData } = usePermissionsQuery({
		page: 1,
		perPage: 500,
	});

	const roles = rolesData?.data.data ?? [];
	const totalCount = rolesData?.data.meta.totalCount ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
	const permissions = permissionsData?.data.data ?? [];

	function handleEdit(role: RoleList): void {
		setSelectedRole(role);
		setEditOpen(true);
	}

	function handleDelete(role: RoleList): void {
		setSelectedRole(role);
		setDeleteOpen(true);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Roles</h1>
					<p className="text-muted-foreground">
						Manage roles and permission assignments.
					</p>
				</div>
				<Button
					onClick={() => {
						setCreateOpen(true);
					}}
				>
					Add Role
				</Button>
			</div>

			<Card>
				<CardContent className="pt-6 space-y-4">
					<Input
						placeholder="Search roles..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
						}}
						className="max-w-sm"
					/>

					<RolesTable
						data={roles}
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

			<RoleFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				permissions={permissions}
			/>

			<RoleFormDialog
				open={editOpen}
				onOpenChange={(open) => {
					setEditOpen(open);
					if (!open) setSelectedRole(null);
				}}
				role={selectedRole}
				permissions={permissions}
			/>

			<RoleDeleteDialog
				open={deleteOpen}
				onOpenChange={(open) => {
					setDeleteOpen(open);
					if (!open) setSelectedRole(null);
				}}
				role={selectedRole}
			/>
		</div>
	);
}

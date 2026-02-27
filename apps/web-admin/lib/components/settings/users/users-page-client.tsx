"use client";

import * as React from "react";

import type { UserDetail, UserList } from "@repo/types";
import { Button, Card, CardContent, Input } from "@repo/ui";

import { useRolesQuery } from "../../../hooks/roles/use-roles-query";
import { useUsersQuery } from "../../../hooks/users/use-users-query";
import { UserDeleteDialog } from "./user-delete-dialog";
import { UserFormDialog } from "./user-form-dialog";
import { UsersTable } from "./users-table";

export function UsersPageClient(): React.JSX.Element {
	const [page, setPage] = React.useState(1);
	const [perPage] = React.useState(10);
	const [search, setSearch] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");

	const [createOpen, setCreateOpen] = React.useState(false);
	const [editOpen, setEditOpen] = React.useState(false);
	const [deleteOpen, setDeleteOpen] = React.useState(false);
	const [selectedUser, setSelectedUser] = React.useState<UserList | null>(null);
	const [selectedUserDetail, setSelectedUserDetail] =
		React.useState<UserDetail | null>(null);

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

	const { data: usersData, isLoading } = useUsersQuery({
		page,
		perPage,
		search: debouncedSearch || undefined,
	});

	// Fetch all roles for form select (no pagination — load enough)
	const { data: rolesData } = useRolesQuery({ page: 1, perPage: 100 });

	const users = usersData?.data.data ?? [];
	const totalCount = usersData?.data.meta.totalCount ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
	const roles = rolesData?.data.data ?? [];

	function handleEdit(user: UserList): void {
		// Convert UserList to the subset we pass as UserDetail
		const detail: UserDetail = {
			id: user.id,
			name: user.name,
			email: user.email,
			status: user.status,
			remark: user.remark,
			roles: user.roles.map((name) => ({ id: name, name })),
			created_at: user.created_at,
			updated_at: user.updated_at,
		};
		setSelectedUserDetail(detail);
		setEditOpen(true);
	}

	function handleDelete(user: UserList): void {
		setSelectedUser(user);
		setDeleteOpen(true);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Users</h1>
					<p className="text-muted-foreground">
						Manage user accounts and role assignments.
					</p>
				</div>
				<Button
					onClick={() => {
						setCreateOpen(true);
					}}
				>
					Add User
				</Button>
			</div>

			<Card>
				<CardContent className="pt-6 space-y-4">
					<Input
						placeholder="Search users..."
						value={search}
						onChange={(e) => {
							setSearch(e.target.value);
						}}
						className="max-w-sm"
					/>

					<UsersTable
						data={users}
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

			<UserFormDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				roles={roles}
			/>

			<UserFormDialog
				open={editOpen}
				onOpenChange={(open) => {
					setEditOpen(open);
					if (!open) setSelectedUserDetail(null);
				}}
				user={selectedUserDetail}
				roles={roles}
			/>

			<UserDeleteDialog
				open={deleteOpen}
				onOpenChange={(open) => {
					setDeleteOpen(open);
					if (!open) setSelectedUser(null);
				}}
				user={selectedUser}
			/>
		</div>
	);
}

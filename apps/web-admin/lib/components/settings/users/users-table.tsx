"use client";

import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import type { UserList } from "@repo/types";
import {
	Badge,
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@repo/ui";

interface UsersTableProps {
	data: UserList[];
	isLoading: boolean;
	onEdit: (user: UserList) => void;
	onDelete: (user: UserList) => void;
}

const STATUS_VARIANT: Record<
	string,
	"default" | "secondary" | "destructive" | "outline"
> = {
	active: "default",
	inactive: "secondary",
	suspended: "outline",
	blocked: "destructive",
};

export function UsersTable({
	data,
	isLoading,
	onEdit,
	onDelete,
}: UsersTableProps): React.JSX.Element {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Email</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Roles</TableHead>
					<TableHead>Created At</TableHead>
					<TableHead className="w-12" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{isLoading ? (
					// Skeleton rows while loading
					Array.from({ length: 5 }).map((_, i) => (
						<TableRow key={i}>
							{Array.from({ length: 6 }).map((__, j) => (
								<TableCell key={j}>
									<div className="h-4 animate-pulse rounded bg-muted" />
								</TableCell>
							))}
						</TableRow>
					))
				) : data.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={6}
							className="py-8 text-center text-muted-foreground"
						>
							No users found.
						</TableCell>
					</TableRow>
				) : (
					data.map((user) => (
						<TableRow key={user.id}>
							<TableCell className="font-medium">{user.name}</TableCell>
							<TableCell>{user.email}</TableCell>
							<TableCell>
								<Badge variant={STATUS_VARIANT[user.status] ?? "outline"}>
									{user.status}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex flex-wrap gap-1">
									{user.roles.map((role) => (
										<Badge key={role} variant="secondary">
											{role}
										</Badge>
									))}
								</div>
							</TableCell>
							<TableCell>
								{new Date(user.created_at).toLocaleDateString()}
							</TableCell>
							<TableCell>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontal className="h-4 w-4" />
											<span className="sr-only">Open menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => {
												onEdit(user);
											}}
										>
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => {
												onDelete(user);
											}}
										>
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))
				)}
			</TableBody>
		</Table>
	);
}

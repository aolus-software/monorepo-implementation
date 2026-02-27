"use client";

import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import type { RoleList } from "@repo/types";
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

interface RolesTableProps {
	data: RoleList[];
	isLoading: boolean;
	onEdit: (role: RoleList) => void;
	onDelete: (role: RoleList) => void;
}

export function RolesTable({
	data,
	isLoading,
	onEdit,
	onDelete,
}: RolesTableProps): React.JSX.Element {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Permissions</TableHead>
					<TableHead>Created At</TableHead>
					<TableHead className="w-12" />
				</TableRow>
			</TableHeader>
			<TableBody>
				{isLoading ? (
					Array.from({ length: 5 }).map((_, i) => (
						<TableRow key={i}>
							{Array.from({ length: 4 }).map((__, j) => (
								<TableCell key={j}>
									<div className="h-4 animate-pulse rounded bg-muted" />
								</TableCell>
							))}
						</TableRow>
					))
				) : data.length === 0 ? (
					<TableRow>
						<TableCell
							colSpan={4}
							className="py-8 text-center text-muted-foreground"
						>
							No roles found.
						</TableCell>
					</TableRow>
				) : (
					data.map((role) => (
						<TableRow key={role.id}>
							<TableCell className="font-medium">{role.name}</TableCell>
							<TableCell>
								<Badge variant="secondary">{role.permissions_count}</Badge>
							</TableCell>
							<TableCell>
								{new Date(role.created_at).toLocaleDateString()}
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
												onEdit(role);
											}}
										>
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => {
												onDelete(role);
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

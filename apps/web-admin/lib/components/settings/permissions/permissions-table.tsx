"use client";

import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import type { PermissionList } from "@repo/types";
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

interface PermissionsTableProps {
	data: PermissionList[];
	isLoading: boolean;
	onEdit: (permission: PermissionList) => void;
	onDelete: (permission: PermissionList) => void;
}

export function PermissionsTable({
	data,
	isLoading,
	onEdit,
	onDelete,
}: PermissionsTableProps): React.JSX.Element {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
					<TableHead>Group</TableHead>
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
							No permissions found.
						</TableCell>
					</TableRow>
				) : (
					data.map((perm) => (
						<TableRow key={perm.id}>
							<TableCell className="font-medium">{perm.name}</TableCell>
							<TableCell>
								<Badge variant="secondary">{perm.group}</Badge>
							</TableCell>
							<TableCell>
								{new Date(perm.created_at).toLocaleDateString()}
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
												onEdit(perm);
											}}
										>
											Edit
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive"
											onClick={() => {
												onDelete(perm);
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

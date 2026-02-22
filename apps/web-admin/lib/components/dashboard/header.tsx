"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import {
	Avatar,
	AvatarFallback,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@repo/ui";

import { useAuth } from "../../context/auth-context";

function getUserInitials(name: string): string {
	return name
		.split(" ")
		.map((part) => part[0] ?? "")
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

export function DashboardHeader(): React.JSX.Element {
	const { user, logout } = useAuth();
	const router = useRouter();

	const handleLogout = React.useCallback((): void => {
		logout();
		router.push("/");
	}, [logout, router]);

	const displayName = user?.name ?? "User";
	const displayEmail = user?.email ?? "";
	const initials = getUserInitials(displayName);

	return (
		<header className="flex h-16 items-center justify-between border-b bg-card px-6">
			<h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						className="flex items-center gap-2 rounded-md p-1 transition-colors hover:bg-accent"
					>
						<Avatar className="h-8 w-8">
							<AvatarFallback className="text-xs">{initials}</AvatarFallback>
						</Avatar>
						<span className="text-sm font-medium text-foreground">
							{displayName}
						</span>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-48">
					<DropdownMenuLabel>
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium">{displayName}</p>
							<p className="text-xs text-muted-foreground">{displayEmail}</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</header>
	);
}

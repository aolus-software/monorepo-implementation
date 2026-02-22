"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Separator, cn } from "@repo/ui";

interface NavItem {
	label: string;
	href: string;
}

const navItems: NavItem[] = [{ label: "Dashboard", href: "/dashboard" }];

export function DashboardSidebar(): React.JSX.Element {
	const pathname = usePathname();

	return (
		<aside className="flex h-screen w-64 flex-col border-r bg-card">
			<div className="flex h-16 items-center border-b px-6">
				<span className="text-lg font-bold tracking-tight text-foreground">
					Admin Panel
				</span>
			</div>
			<nav className="flex-1 space-y-1 p-4">
				{navItems.map((item) => (
					<Link
						key={item.href}
						href={item.href}
						className={cn(
							"flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
							pathname === item.href
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
						)}
					>
						{item.label}
					</Link>
				))}
			</nav>
			<Separator />
			<div className="p-4">
				<p className="text-xs text-muted-foreground">Admin Panel v1.0</p>
			</div>
		</aside>
	);
}

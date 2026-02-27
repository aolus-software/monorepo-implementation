"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Separator, cn } from "@repo/ui";

interface NavItem {
	label: string;
	href: string;
}

const mainNavItems: NavItem[] = [{ label: "Dashboard", href: "/dashboard" }];

const settingsNavItems: NavItem[] = [
	{ label: "Users", href: "/dashboard/settings/users" },
	{ label: "Roles", href: "/dashboard/settings/roles" },
	{ label: "Permissions", href: "/dashboard/settings/permissions" },
];

function NavLink({
	item,
	pathname,
}: {
	item: NavItem;
	pathname: string;
}): React.JSX.Element {
	const isActive =
		pathname === item.href || pathname.startsWith(item.href + "/");
	return (
		<Link
			href={item.href}
			className={cn(
				"flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
				isActive
					? "bg-primary text-primary-foreground"
					: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
			)}
		>
			{item.label}
		</Link>
	);
}

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
				{mainNavItems.map((item) => (
					<NavLink key={item.href} item={item} pathname={pathname} />
				))}

				<Separator className="my-3" />

				<p className="px-3 py-1 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
					Settings
				</p>
				{settingsNavItems.map((item) => (
					<NavLink key={item.href} item={item} pathname={pathname} />
				))}
			</nav>
			<Separator />
			<div className="p-4">
				<p className="text-xs text-muted-foreground">Admin Panel v1.0</p>
			</div>
		</aside>
	);
}

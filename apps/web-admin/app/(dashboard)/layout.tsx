import type { Metadata } from "next";
import * as React from "react";

import { DashboardHeader } from "../../lib/components/dashboard/header";
import { DashboardSidebar } from "../../lib/components/dashboard/sidebar";

export const metadata: Metadata = {
	title: {
		template: "%s - Admin Panel",
		default: "Dashboard - Admin Panel",
	},
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<div className="flex min-h-screen bg-background">
			<DashboardSidebar />
			<div className="flex flex-1 flex-col overflow-hidden">
				<DashboardHeader />
				<main className="flex-1 overflow-y-auto p-6">{children}</main>
			</div>
		</div>
	);
}

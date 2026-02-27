import type { Metadata } from "next";
import * as React from "react";

import { UsersPageClient } from "@/lib/components/settings/users/users-page-client";

export const metadata: Metadata = {
	title: "Users - Admin Panel",
};

export default function UsersPage(): React.JSX.Element {
	return <UsersPageClient />;
}

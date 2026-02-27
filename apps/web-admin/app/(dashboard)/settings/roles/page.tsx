import type { Metadata } from "next";
import * as React from "react";

import { RolesPageClient } from "@/lib/components/settings/roles/roles-page-client";

export const metadata: Metadata = {
	title: "Roles - Admin Panel",
};

export default function RolesPage(): React.JSX.Element {
	return <RolesPageClient />;
}

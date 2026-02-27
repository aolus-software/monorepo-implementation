import type { Metadata } from "next";
import * as React from "react";

import { PermissionsPageClient } from "@/lib/components/settings/permissions/permissions-page-client";

export const metadata: Metadata = {
	title: "Permissions - Admin Panel",
};

export default function PermissionsPage(): React.JSX.Element {
	return <PermissionsPageClient />;
}

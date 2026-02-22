import type { Metadata } from "next";
import * as React from "react";

import { DashboardContent } from "../../../lib/components/dashboard/content";

export const metadata: Metadata = {
	title: "Dashboard",
};

export default function DashboardPage(): React.JSX.Element {
	return <DashboardContent />;
}

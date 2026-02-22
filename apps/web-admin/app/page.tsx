import type { Metadata } from "next";
import * as React from "react";

import { LoginForm } from "@/lib/components/login-form";

export const metadata: Metadata = {
	title: "Sign In - Admin Panel",
};

export default function LoginPage(): React.JSX.Element {
	return (
		<main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
			<LoginForm />
		</main>
	);
}

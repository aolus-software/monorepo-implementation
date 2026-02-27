import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import * as React from "react";

import { AuthProvider } from "@/lib/context/auth-context";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@repo/ui";

import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Admin Panel",
	description: "Administration dashboard",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): React.JSX.Element {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<QueryProvider>
					<AuthProvider>{children}</AuthProvider>
				</QueryProvider>
				<Toaster />
			</body>
		</html>
	);
}

"use client";

import * as React from "react";

import {
	Badge,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui";

import { useAuth } from "../../context/auth-context";

interface StatCard {
	title: string;
	value: string;
	description: string;
}

function buildStatCards(): StatCard[] {
	return [
		{ title: "Total Users", value: "--", description: "Registered users" },
		{ title: "Active Sessions", value: "--", description: "Current sessions" },
		{ title: "Roles", value: "--", description: "Configured roles" },
		{ title: "Permissions", value: "--", description: "Defined permissions" },
	];
}

export function DashboardContent(): React.JSX.Element {
	const { user } = useAuth();
	const statCards = buildStatCards();

	if (user === null) {
		return <div className="text-muted-foreground text-sm">Loading...</div>;
	}

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h2 className="text-2xl font-bold tracking-tight text-foreground">
					Welcome back, {user.name}
				</h2>
				<p className="text-muted-foreground">
					Here is an overview of your admin panel.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map((card) => (
					<Card key={card.title}>
						<CardHeader className="pb-2">
							<CardDescription>{card.title}</CardDescription>
							<CardTitle className="text-3xl">{card.value}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-xs text-muted-foreground">
								{card.description}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Account Information</CardTitle>
						<CardDescription>Your current account details</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Name</span>
							<span className="text-sm font-medium">{user.name}</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-sm text-muted-foreground">Email</span>
							<span className="text-sm font-medium">{user.email}</span>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Roles and Permissions</CardTitle>
						<CardDescription>Access control for your account</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div>
							<p className="mb-2 text-sm font-medium text-muted-foreground">
								Assigned Roles
							</p>
							<div className="flex flex-wrap gap-2">
								{user.roles.length > 0 ? (
									user.roles.map((role) => (
										<Badge key={role} variant="secondary">
											{role}
										</Badge>
									))
								) : (
									<span className="text-sm text-muted-foreground">
										No roles assigned
									</span>
								)}
							</div>
						</div>
						<div>
							<p className="mb-2 text-sm font-medium text-muted-foreground">
								Permissions
							</p>
							<div className="flex flex-wrap gap-2">
								{user.permissions.length > 0 ? (
									user.permissions.map((permission) => (
										<Badge key={permission} variant="outline">
											{permission}
										</Badge>
									))
								) : (
									<span className="text-sm text-muted-foreground">
										No permissions assigned
									</span>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

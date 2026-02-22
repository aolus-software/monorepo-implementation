"use client";

import * as React from "react";

import type { UserInformation } from "@repo/types";

import {
	AUTH_TOKEN_KEY,
	AUTH_USER_KEY,
	COOKIE_MAX_AGE_SECONDS,
} from "../constants/auth";
import type { AuthContextValue, AuthState } from "../types/auth";

const AuthContext = React.createContext<AuthContextValue | null>(null);

const EMPTY_STATE: AuthState = {
	user: null,
	token: null,
	isAuthenticated: false,
};

function loadStateFromStorage(): AuthState {
	const rawToken = localStorage.getItem(AUTH_TOKEN_KEY);
	const rawUser = localStorage.getItem(AUTH_USER_KEY);

	if (rawToken === null || rawUser === null) {
		return EMPTY_STATE;
	}

	try {
		const user = JSON.parse(rawUser) as UserInformation;
		return { user, token: rawToken, isAuthenticated: true };
	} catch {
		return EMPTY_STATE;
	}
}

export function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	const [state, setState] = React.useState<AuthState>(EMPTY_STATE);

	// Load persisted auth state after hydration to avoid server/client mismatch
	React.useEffect(() => {
		setState(loadStateFromStorage());
	}, []);

	const login = React.useCallback(
		(user: UserInformation, token: string): void => {
			localStorage.setItem(AUTH_TOKEN_KEY, token);
			localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
			document.cookie = `${AUTH_TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
			setState({ user, token, isAuthenticated: true });
		},
		[],
	);

	const logout = React.useCallback((): void => {
		localStorage.removeItem(AUTH_TOKEN_KEY);
		localStorage.removeItem(AUTH_USER_KEY);
		document.cookie = `${AUTH_TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
		setState({ user: null, token: null, isAuthenticated: false });
	}, []);

	const value = React.useMemo(
		(): AuthContextValue => ({ ...state, login, logout }),
		[state, login, logout],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
	const context = React.useContext(AuthContext);
	if (context === null) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
}

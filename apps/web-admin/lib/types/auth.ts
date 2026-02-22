import type { UserInformation } from "@repo/types";

export interface LoginFormValues {
	email: string;
	password: string;
}

export interface LoginApiResponse {
	user: UserInformation;
	accessToken: string;
}

export interface AuthState {
	user: UserInformation | null;
	token: string | null;
	isAuthenticated: boolean;
}

export interface AuthContextValue extends AuthState {
	login: (user: UserInformation, token: string) => void;
	logout: () => void;
}

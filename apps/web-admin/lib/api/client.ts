import axios from "axios";

import { AUTH_TOKEN_KEY } from "../constants/auth";

const apiBaseUrl: string =
	process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

export const apiClient = axios.create({
	baseURL: apiBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

// Inject Bearer token from localStorage on every request
apiClient.interceptors.request.use((config) => {
	if (typeof window !== "undefined") {
		const token = localStorage.getItem(AUTH_TOKEN_KEY);
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

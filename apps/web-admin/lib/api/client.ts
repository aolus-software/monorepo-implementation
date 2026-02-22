import axios from "axios";

const apiBaseUrl: string =
	process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:3001";

export const apiClient = axios.create({
	baseURL: apiBaseUrl,
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 10000,
});

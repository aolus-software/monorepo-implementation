import {
	ErrorHandlerPlugin,
	LoggerPlugin,
	RequestPlugin,
	SecurityPlugin,
} from "@repo/elysia";
import { Elysia } from "elysia";
import { env } from "./env";

export const baseApp = new Elysia({ name: "base-app" })
	.use(RequestPlugin)
	.use(
		SecurityPlugin({
			corsOptions: {
				origin: env.CORS_ORIGIN,
				methods: env.CORS_METHODS,
				allowedHeaders: env.CORS_ALLOWED_HEADERS,
				credentials: env.CORS_CREDENTIALS,
				maxAge: env.CORS_MAX_AGE,
			},
			rateLimitOptions: undefined,
			helmetOptions: undefined,
		}),
	)
	.use(LoggerPlugin)
	.use(ErrorHandlerPlugin);

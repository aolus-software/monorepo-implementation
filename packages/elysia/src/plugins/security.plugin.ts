import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { helmet } from "elysia-helmet";
import { rateLimit } from "elysia-rate-limit";

import { RateLimitError } from "../errors/to-many-request-error";

interface SecurityPluginsOptions {
	corsOptions:
		| {
				origin: string | string[];
				methods: string[];
				allowedHeaders: string[];
				credentials: boolean;
				maxAge: number;
		  }
		| undefined;

	rateLimitOptions:
		| {
				max: number;
				duration: number;
				headers: boolean;
				errorResponse: RateLimitError;
		  }
		| undefined;

	helmetOptions: Parameters<typeof helmet>[0] | undefined;
}

const defaultOptions: SecurityPluginsOptions = {
	corsOptions: {
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
		maxAge: 86400,
	},
	rateLimitOptions: {
		max: 100,
		duration: 60 * 1000,
		headers: true,
		errorResponse: new RateLimitError(),
	},
	helmetOptions: {
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:", "https:"],
				connectSrc: ["'self'"],
				fontSrc: ["'self'"],
				objectSrc: ["'none'"],
				frameSrc: ["'none'"],
			},
		},
		aot: true,
	},
};

export const CorsDefaultOptions = defaultOptions.corsOptions;
export const RateLimitDefaultOptions = defaultOptions.rateLimitOptions;
export const HelmetDefaultOptions = defaultOptions.helmetOptions;

export const SecurityPlugin = (
	options: SecurityPluginsOptions = defaultOptions,
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
) => {
	options.corsOptions ??= defaultOptions.corsOptions;
	options.rateLimitOptions ??= defaultOptions.rateLimitOptions;
	options.helmetOptions ??= defaultOptions.helmetOptions;

	return new Elysia({ name: "security" })
		.use(cors(options.corsOptions))
		.use(rateLimit(options.rateLimitOptions))
		.use(helmet(options.helmetOptions));
};

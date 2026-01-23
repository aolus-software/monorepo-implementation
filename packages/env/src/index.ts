import { z } from "zod";

export const databaseEnvSchema = z.object({
	DATABASE_URL: z.string(),
});

export const redisEnvSchema = z.object({
	REDIS_URL: z.string(),
});

export const jwtEnvSchema = z.object({
	JWT_SECRET: z.string().min(32),
	JWT_EXPIRES_IN: z.string().default("1d"),
	JWT_REFRESH_SECRET: z.string().min(32),
	JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
});

export const corsEnvSchema = z.object({});

export const mailerEnvSchema = z.object({
	// MAILER_HOST: z.string(),
	// MAILER_PORT: z.coerce.number(),
	// MAILER_SECURE: z.coerce.boolean().default(false),
	// MAILER_USER: z.string(),
	// MAILER_PASSWORD: z.string(),
	// MAILER_FROM: z.string().email(),
});

export const appEnvSchema = z.object({
	APP_NAME: z.string(),
	NODE_ENV: z.enum(["development", "production", "staging"]),
	LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
});

export const apiEnvSchema = z
	.object({
		PORT: z.coerce.number().default(3000),
	})
	.merge(appEnvSchema)
	.merge(corsEnvSchema)
	.merge(jwtEnvSchema)
	.merge(mailerEnvSchema);

export const webEnvSchema = z.object({
	NEXT_PUBLIC_API_URL: z.string().url(),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type RedisEnv = z.infer<typeof redisEnvSchema>;
export type JwtEnv = z.infer<typeof jwtEnvSchema>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;

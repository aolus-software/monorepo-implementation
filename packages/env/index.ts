import { z } from "zod";

export const databaseEnvSchema = z.object({
	DATABASE_URL: z.string(),
});

export const redisEnvSchema = z.object({
	REDIS_URL: z.string(),
});

export const jwtEnvSchema = z.object({
	JWT_SECRET: z.string().min(32),
});

export const apiEnvSchema = z
	.object({
		PORT: z.coerce.number().default(3000),
		CORS_ORIGIN: z.string().url().optional(),
	})
	.merge(databaseEnvSchema)
	.merge(redisEnvSchema)
	.merge(jwtEnvSchema);

export const webEnvSchema = z.object({
	NEXT_PUBLIC_API_URL: z.string().url(),
});

export type DatabaseEnv = z.infer<typeof databaseEnvSchema>;
export type RedisEnv = z.infer<typeof redisEnvSchema>;
export type JwtEnv = z.infer<typeof jwtEnvSchema>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;

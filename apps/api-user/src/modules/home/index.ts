import { Elysia, t } from "elysia";
import {
	AppInfoSchema,
	HealthCheckErrorSchema,
	HealthCheckSuccessSchema,
} from "./schema";
import { baseApp } from "../../base";
import { ResponseUtils, SuccessResponseSchema } from "@repo/elysia";
import { apiEnvSchema } from "@repo/env";
import { db } from "../../db";

export const HomeModule = new Elysia({
	detail: { tags: ["General"], security: [], description: "General APIs" },
})
	.use(baseApp)
	// ============================================
	// GET: / ROOT ENDPOINT
	// ============================================
	.get(
		"/",
		() => {
			const env = apiEnvSchema.parse(process.env);

			return ResponseUtils.success(
				{
					app_name: env.APP_NAME,
					app_env: env.NODE_ENV,
					date: new Date().toISOString(),
				},
				`Welcome to ${env.APP_NAME}`,
			);
		},
		{
			response: {
				200: SuccessResponseSchema(AppInfoSchema),
			},
			detail: {
				summary: "API root endpoint",
				description: "Returns basic information about the API",
			},
		},
	)

	// ============================================
	// HEALTH CHECK
	// ============================================
	.get(
		"/health",
		async ({ set }) => {
			const healthStatus = {
				status: "healthy",
				timestamp: new Date().toISOString(),
				services: {
					database: "healthy",
					redis: "healthy",
				},
			};

			// TODO: Check Redis
			// try {
			// 	const redis = RedisClient.getRedisClient();
			// 	await redis.ping();
			// 	healthStatus.services.redis = "healthy";
			// } catch {
			// 	healthStatus.services.redis = "unhealthy";
			// 	healthStatus.status = "degraded";
			// }

			// Check Database
			try {
				await db.execute(`SELECT 1`);
				healthStatus.services.database = "healthy";
			} catch {
				healthStatus.services.database = "unhealthy";
				healthStatus.status = "degraded";
			}

			// Set appropriate status code
			if (healthStatus.status === "degraded") {
				set.status = 503;
				return {
					status: 503,
					message: "Service partially unavailable",
					data: null,
					success: false,
				};
			}

			return {
				status: 200,
				message: "All systems operational",
				data: healthStatus,
				success: true,
			};
		},
		{
			response: {
				200: HealthCheckSuccessSchema,
				503: HealthCheckErrorSchema,
			},
			detail: {
				summary: "Health check",
				description: "Check the health status of all services",
			},
		},
	)

	// ============================================
	// LIVENESS CHECK
	// ============================================
	.get(
		"/live",
		() => {
			// Simple check that the service is running
			return ResponseUtils.success({ alive: true }, "Service is alive");
		},
		{
			response: {
				200: SuccessResponseSchema(t.Object({ alive: t.Boolean() })),
			},
			detail: {
				summary: "Liveness check",
				description: "Check if the service is alive",
			},
		},
	);

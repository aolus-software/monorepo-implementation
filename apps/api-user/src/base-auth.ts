import { AuthPlugin } from "@repo/elysia";
import { Elysia } from "elysia";

import { baseApp } from "./base";
import { db } from "./db";
import { env } from "./env";

/**
 * Base Authenticated App
 *
 * Extends the base app with authentication support.
 * Use this for routes that require authentication.
 *
 * Features:
 * - JWT authentication with bearer token
 * - Automatic user information retrieval
 * - Role and permission checking
 * - User caching (when Redis is configured)
 *
 * @example
 * ```ts
 * import { baseAuthApp } from './base-auth';
 *
 * export const ProfileModule = new Elysia({ prefix: '/profile' })
 *   .use(baseAuthApp)
 *   .get('/', ({ user }) => {
 *     // user is automatically available and typed
 *     return user;
 *   })
 *   // Use RBAC macro for specific routes
 *   .get('/premium', ({ user }) => 'Premium content', {
 *     rbac: { roles: ['premium'] }
 *   });
 * ```
 */
export const baseAuthApp = new Elysia({ name: "base-auth-app" })
	.use(baseApp)
	.use(
		AuthPlugin({
			jwt: {
				secret: env.JWT_SECRET,
				exp: env.JWT_EXPIRES_IN,
				alg: "HS256",
			},
			db: db,
			// Optional: Add Redis cache when available
			// cache: {
			//   provider: redisCache,
			//   ttl: 3600,
			//   keyPrefix: 'user:'
			// },
			requireAuth: true,
			messages: {
				noToken: "Authentication required",
				invalidToken: "Invalid or expired authentication token",
				userNotFound: "User not found or inactive",
			},
		}),
	);

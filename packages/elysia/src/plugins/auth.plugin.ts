import bearer from "@elysiajs/bearer";
import type { JWTOption } from "@elysiajs/jwt";
import jwt from "@elysiajs/jwt";
import type { DbClient } from "@repo/database";
import { UserRepository } from "@repo/database";
import type { UserInformation } from "@repo/types";
import Elysia from "elysia";

import { ForbiddenError, UnauthorizedError } from "../errors";

// ============================================
// TYPES & INTERFACES
// ============================================

/**
 * JWT Payload structure
 */
interface JWTPayload {
	id: string;
	[key: string]: unknown;
}

/**
 * Cache interface for optional caching support
 */
interface CacheProvider {
	get(key: string): Promise<UserInformation | null>;
	set(key: string, value: UserInformation, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
}

/**
 * Configuration options for AuthPlugin
 */
interface AuthPluginOptions {
	/**
	 * JWT configuration
	 */
	jwt: {
		name?: string;
		secret: string;
		exp?: string;
		alg?: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512";
	};

	/**
	 * Database client instance for user lookups
	 */
	db: DbClient;

	/**
	 * Optional cache provider for user information caching
	 * If provided, user data will be cached to reduce database queries
	 */
	cache?: {
		provider: CacheProvider;
		ttl?: number; // Cache TTL in seconds (default: 3600)
		keyPrefix?: string; // Cache key prefix (default: "user:")
	};

	/**
	 * Whether to automatically check if user is authenticated
	 * If false, routes must manually check authentication
	 * @default true
	 */
	requireAuth?: boolean;

	/**
	 * Custom error messages
	 */
	messages?: {
		noToken?: string;
		invalidToken?: string;
		userNotFound?: string;
	};
}

/**
 * RBAC Guard configuration
 */
interface RBACGuardOptions {
	/**
	 * Required roles (user must have at least one)
	 */
	roles?: string[];

	/**
	 * Required permissions (user must have all)
	 */
	permissions?: string[];

	/**
	 * Bypass role for superuser/admin
	 * @default "superuser"
	 */
	superuserRole?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate cache key for user information
 */
const getUserCacheKey = (userId: string, prefix = "user:"): string => {
	return `${prefix}${userId}`;
};

/**
 * Check if user has required roles
 */
const checkRoles = (
	user: UserInformation,
	requiredRoles: string[],
	superuserRole = "superuser",
): boolean => {
	if (user.roles.includes(superuserRole)) {
		return true;
	}

	return requiredRoles.some((role) => user.roles.includes(role));
};

/**
 * Check if user has required permissions
 */
const checkPermissions = (
	user: UserInformation,
	requiredPermissions: string[],
	superuserRole = "superuser",
): boolean => {
	if (user.roles.includes(superuserRole)) {
		return true;
	}

	return requiredPermissions.every((permission) =>
		user.permissions.includes(permission),
	);
};

// ============================================
// AUTH PLUGIN
// ============================================

/**
 * Enhanced Authentication Plugin with RBAC support
 *
 * Features:
 * - JWT authentication with bearer token
 * - User information retrieval from database
 * - Optional caching for performance
 * - Role-Based Access Control (RBAC)
 * - Permission checking
 * - Customizable configuration
 *
 * @example
 * ```ts
 * const app = new Elysia()
 *   .use(AuthPlugin({
 *     jwt: {
 *       secret: env.JWT_SECRET,
 *       exp: '1d'
 *     },
 *     db: db,
 *     cache: {
 *       provider: redisCache,
 *       ttl: 3600
 *     }
 *   }))
 *   .get('/profile', ({ user }) => user)
 *   .guard({ roles: ['admin'] }, (app) =>
 *     app.get('/admin', () => 'Admin only')
 *   )
 * ```
 */
export const AuthPlugin = (options: AuthPluginOptions): Elysia => {
	const {
		jwt: jwtConfig,
		db,
		cache,
		requireAuth = true,
		messages = {},
	} = options;

	const errorMessages = {
		noToken: messages.noToken ?? "Authentication required",
		invalidToken: messages.invalidToken ?? "Invalid authentication token",
		userNotFound: messages.userNotFound ?? "User not found",
	};

	// Setup JWT with default values
	const jwtOptions: JWTOption<string> = {
		name: jwtConfig.name ?? "jwt",
		secret: jwtConfig.secret,
		exp: jwtConfig.exp,
		alg: jwtConfig.alg,
	};

	return (
		new Elysia({ name: "auth" })
			.use(jwt(jwtOptions))
			.use(bearer())
			// Derive user information from bearer token
			.derive({ as: "global" }, async (context) => {
				// If auth is not required, allow request without token
				if (!requireAuth && !context.bearer) {
					return { user: null as UserInformation | null };
				}

				// If auth is required, token must be present
				if (!context.bearer) {
					throw new UnauthorizedError(errorMessages.noToken);
				}

				let user: UserInformation | null = null;

				try {
					// Verify JWT token
					const payload = (await context.jwt.verify(context.bearer)) as
						| JWTPayload
						| false;

					if (!payload || typeof payload === "boolean" || !payload.id) {
						throw new UnauthorizedError(errorMessages.invalidToken);
					}

					// Ensure payload.id is a string
					const userId =
						typeof payload.id === "string"
							? payload.id
							: typeof payload.id === "number"
								? String(payload.id)
								: null;

					if (!userId) {
						throw new UnauthorizedError("Invalid user ID in token");
					}

					// Try to get from cache if available
					if (cache?.provider) {
						const cacheKey = getUserCacheKey(
							userId,
							cache.keyPrefix ?? "user:",
						);
						user = await cache.provider.get(cacheKey);
					}

					// If not in cache, fetch from database
					if (!user) {
						const userRepo = UserRepository(db);
						// UserInformation throws UnauthorizedError if user not found

						const userInfo = await userRepo.UserInformation(userId);
						user = userInfo;

						// Cache the user information if cache is available
						if (cache?.provider) {
							const cacheKey = getUserCacheKey(
								userId,
								cache.keyPrefix ?? "user:",
							);
							await cache.provider.set(cacheKey, user, cache.ttl ?? 3600);
						}
					}
				} catch (error: unknown) {
					// If error is already an UnauthorizedError, re-throw it
					if (error instanceof UnauthorizedError) {
						throw error;
					}
					// Otherwise, throw generic invalid token error
					throw new UnauthorizedError(errorMessages.invalidToken);
				}

				return { user };
			})
			.macro(({ onBeforeHandle }) => ({
				/**
				 * RBAC Guard Macro
				 * Usage: .rbac({ roles: [...], permissions: [...] })
				 */
				// todo: rebuild the auth macro to avoid this unsafe cast
				rbac(config: RBACGuardOptions) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-call
					onBeforeHandle((context) => {
						// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
						const user = context.user as UserInformation | null;

						if (!user) {
							throw new UnauthorizedError(errorMessages.noToken);
						}

						const superuserRole = config.superuserRole ?? "superuser";

						// Check roles if specified
						if (config.roles && config.roles.length > 0) {
							if (!checkRoles(user, config.roles, superuserRole)) {
								throw new ForbiddenError(
									"You do not have the required roles to access this resource.",
								);
							}
						}

						// Check permissions if specified
						if (config.permissions && config.permissions.length > 0) {
							if (!checkPermissions(user, config.permissions, superuserRole)) {
								throw new ForbiddenError(
									"You do not have the required permissions to access this resource.",
								);
							}
						}
					});
				},
			}))
	);
};

// ============================================
// STANDALONE GUARD HELPERS
// ============================================

/**
 * Check if user has required roles (for manual checking)
 */
export const requireRoles = (
	user: UserInformation,
	roles: string[],
	superuserRole = "superuser",
): void => {
	if (!checkRoles(user, roles, superuserRole)) {
		throw new ForbiddenError(
			"You do not have the required roles to access this resource.",
		);
	}
};

/**
 * Check if user has required permissions (for manual checking)
 */
export const requirePermissions = (
	user: UserInformation,
	permissions: string[],
	superuserRole = "superuser",
): void => {
	if (!checkPermissions(user, permissions, superuserRole)) {
		throw new ForbiddenError(
			"You do not have the required permissions to access this resource.",
		);
	}
};

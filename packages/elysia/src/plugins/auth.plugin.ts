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

interface JWTPayload {
	id: string;
	[key: string]: unknown;
}

interface CacheProvider {
	get(key: string): Promise<UserInformation | null>;
	set(key: string, value: UserInformation, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
}

interface AuthPluginOptions {
	jwt: {
		secret: string;
		exp?: string;
		alg?: "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512";
	};
	db: DbClient;
	// Reduces database queries by caching user lookups
	cache?: {
		provider: CacheProvider;
		ttl?: number;
		keyPrefix?: string;
	};
	requireAuth?: boolean;
	messages?: {
		noToken?: string;
		invalidToken?: string;
		userNotFound?: string;
	};
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getUserCacheKey = (userId: string, prefix = "user:"): string => {
	return `${prefix}${userId}`;
};

const checkRoles = (
	user: UserInformation,
	requiredRoles: string[],
	superuserRole = "superuser",
): boolean => {
	// Superuser bypasses all role checks
	if (user.roles.includes(superuserRole)) {
		return true;
	}

	return requiredRoles.some((role) => user.roles.includes(role));
};

const checkPermissions = (
	user: UserInformation,
	requiredPermissions: string[],
	superuserRole = "superuser",
): boolean => {
	// Superuser bypasses all permission checks
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
export const AuthPlugin = (options: AuthPluginOptions) => {
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

	const jwtOptions: JWTOption<string> = {
		name: "jwt",
		secret: jwtConfig.secret,
		exp: jwtConfig.exp,
		alg: jwtConfig.alg,
	};

	return (
		new Elysia({ name: "auth" })
			.use(jwt(jwtOptions))
			.use(bearer())
			// eslint-disable-next-line @typescript-eslint/no-shadow
			.derive({ as: "global" }, async ({ jwt, bearer }) => {
				// Allow unauthenticated requests when auth is optional
				if (!requireAuth && !bearer) {
					return { user: null as UserInformation | null };
				}

				if (!jwt) {
					throw new UnauthorizedError(errorMessages.noToken);
				}

				if (!bearer) {
					throw new UnauthorizedError(errorMessages.noToken);
				}

				let user: UserInformation | null = null;

				try {
					const payload = (await jwt.verify(bearer)) as JWTPayload | false;

					if (!payload || typeof payload === "boolean" || !payload.id) {
						throw new UnauthorizedError(errorMessages.invalidToken);
					}

					// Normalize id to string regardless of how it was encoded in the token
					const userId =
						typeof payload.id === "string"
							? payload.id
							: typeof payload.id === "number"
								? String(payload.id)
								: null;

					if (!userId) {
						throw new UnauthorizedError("Invalid user ID in token");
					}

					if (cache?.provider) {
						const cacheKey = getUserCacheKey(
							userId,
							cache.keyPrefix ?? "user:",
						);
						user = await cache.provider.get(cacheKey);
					}

					if (!user) {
						const userRepo = UserRepository(db);
						const userInfo = await userRepo.UserInformation(userId);
						user = userInfo;

						if (cache?.provider) {
							const cacheKey = getUserCacheKey(
								userId,
								cache.keyPrefix ?? "user:",
							);
							await cache.provider.set(cacheKey, user, cache.ttl ?? 3600);
						}
					}
				} catch (error: unknown) {
					// Re-throw known errors, wrap everything else as invalid token
					if (error instanceof UnauthorizedError) {
						throw error;
					}
					throw new UnauthorizedError(errorMessages.invalidToken);
				}

				return { user };
			})
			.macro({
				rbac: (roleOptions: { roles?: string[]; permissions?: string[] }) => ({
					beforeHandle({ user }) {
						if (!user) {
							throw new UnauthorizedError(errorMessages.noToken);
						}

						const { roles, permissions } = roleOptions;

						if (roles && !checkRoles(user, roles)) {
							throw new ForbiddenError(
								"You do not have the required roles to access this resource.",
							);
						}

						if (permissions && !checkPermissions(user, permissions)) {
							throw new ForbiddenError(
								"You do not have the required permissions to access this resource.",
							);
						}
					},
				}),
			})
	);
};

// ============================================
// STANDALONE GUARD HELPERS
// ============================================

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

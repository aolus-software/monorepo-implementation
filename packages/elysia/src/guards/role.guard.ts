import { UserInformation } from "@repo/types";
import { ForbiddenError } from "../errors";

/**
 * Role Guard Helper
 * 
 * Checks if a user has required roles
 * Superuser role bypasses all role checks
 * 
 * @example
 * ```ts
 * .get('/admin', ({ user }) => {
 *   RoleGuard.canActivate(user, ['admin']);
 *   return 'Protected resource';
 * })
 * ```
 */
export class RoleGuard {
	/**
	 * Check if user has at least one of the required roles
	 * @param user - User information with roles and permissions
	 * @param requiredRoles - Array of role names (user needs at least one)
	 * @param superuserRole - Role that bypasses all checks (default: "superuser")
	 * @returns true if user has at least one role
	 * @throws {ForbiddenError} if user lacks all required roles
	 */
	static canActivate(
		user: UserInformation,
		requiredRoles: string[],
		superuserRole: string = "superuser",
	): boolean {
		// Superuser has all roles
		if (user.roles.includes(superuserRole)) {
			return true;
		}

		const userRoles = user.roles || [];
		
		// Check if user has any of the required roles
		const hasAnyRole = requiredRoles.some((role) => userRoles.includes(role));

		if (!hasAnyRole) {
			throw new ForbiddenError(
				"You do not have the required roles to access this resource.",
			);
		}

		return true;
	}

	/**
	 * Check if user has all required roles
	 * @param user - User information with roles and permissions
	 * @param roles - Array of role names that are all required
	 * @param superuserRole - Role that bypasses all checks (default: "superuser")
	 * @returns true if user has all roles
	 * @throws {ForbiddenError} if user lacks any required role
	 */
	static canActivateAll(
		user: UserInformation,
		roles: string[],
		superuserRole: string = "superuser",
	): boolean {
		// Superuser has all roles
		if (user.roles.includes(superuserRole)) {
			return true;
		}

		const userRoles = user.roles || [];
		
		// Check if user has all required roles
		const hasAllRoles = roles.every((role) => userRoles.includes(role));

		if (!hasAllRoles) {
			throw new ForbiddenError(
				"You do not have all the required roles to access this resource.",
			);
		}

		return true;
	}
}

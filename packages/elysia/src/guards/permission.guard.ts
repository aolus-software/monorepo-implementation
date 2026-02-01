import { UserInformation } from "@repo/types";
import { ForbiddenError } from "../errors";

/**
 * Permission Guard Helper
 * 
 * Checks if a user has required permissions
 * Superuser role bypasses all permission checks
 * 
 * @example
 * ```ts
 * .get('/admin', ({ user }) => {
 *   PermissionGuard.canActivate(user, ['admin.users.read']);
 *   return 'Protected resource';
 * })
 * ```
 */
export class PermissionGuard {
	/**
	 * Check if user has all required permissions
	 * @param user - User information with roles and permissions
	 * @param requiredPermissions - Array of permission names that are required
	 * @param superuserRole - Role that bypasses all checks (default: "superuser")
	 * @returns true if user has permissions
	 * @throws {ForbiddenError} if user lacks required permissions
	 */
	static canActivate(
		user: UserInformation,
		requiredPermissions: string[],
		superuserRole: string = "superuser",
	): boolean {
		const userPermissions = user.permissions || [];
		
		// Superuser has all permissions
		if (user.roles.includes(superuserRole)) {
			return true;
		}

		// Check if user has all required permissions
		const hasPermissions = requiredPermissions.every((permission) =>
			userPermissions.includes(permission),
		);

		if (!hasPermissions) {
			throw new ForbiddenError(
				"You do not have the required permissions to access this resource.",
			);
		}

		return true;
	}

	/**
	 * Check if user has at least one of the required permissions
	 * @param user - User information with roles and permissions
	 * @param permissions - Array of permission names (user needs at least one)
	 * @param superuserRole - Role that bypasses all checks (default: "superuser")
	 * @returns true if user has at least one permission
	 * @throws {ForbiddenError} if user lacks all permissions
	 */
	static canActivateAny(
		user: UserInformation,
		permissions: string[],
		superuserRole: string = "superuser",
	): boolean {
		const userPermissions = user.permissions || [];
		
		// Superuser has all permissions
		if (user.roles.includes(superuserRole)) {
			return true;
		}

		// Check if user has any of the required permissions
		const hasAnyPermission = permissions.some((permission) =>
			userPermissions.includes(permission),
		);

		if (!hasAnyPermission) {
			throw new ForbiddenError(
				"You do not have any of the required permissions to access this resource.",
			);
		}

		return true;
	}
}

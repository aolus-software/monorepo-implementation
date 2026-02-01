import { UserRepository } from "@repo/database";
import {
	DatatableType,
	PaginationResponse,
	UserCreate,
	UserDetail,
	UserList,
} from "@repo/types";
import { db } from "../../../db";

const userRepo = UserRepository(db);

export const UserService = {
	/**
	 * Get all users with pagination
	 */
	findAll: async (
		queryParam: DatatableType<{
			status: boolean | string;
			name: string;
			email: string;
			role_id: string;
		}>,
	): Promise<PaginationResponse<UserList>> => {
		return await userRepo.findAll(queryParam);
	},

	/**
	 * Get user by ID
	 */
	findById: async (id: string): Promise<UserDetail> => {
		return await userRepo.getDetail(id);
	},

	/**
	 * Create user
	 */
	create: async (data: UserCreate): Promise<UserDetail> => {
		return await userRepo.create(data);
	},

	/**
	 * Update user
	 */
	update: async (
		id: string,
		data: Omit<UserCreate, "password">,
	): Promise<void> => {
		await userRepo.update(id, data);
	},

	/**
	 * Delete user (soft delete)
	 */
	delete: async (id: string): Promise<void> => {
		await userRepo.delete(id);
	},
};

// User status enum
export const UserStatus = {
	ACTIVE: "active",
	INACTIVE: "inactive",
	SUSPENDED: "suspended",
	BLOCKED: "blocked",
} as const;

export type UserStatusEnum = (typeof UserStatus)[keyof typeof UserStatus];

export interface UserInformation {
	id: string;
	name: string;
	email: string;
	roles: string[];
	permissions: string[];
}

export interface UserList {
	id: string;
	name: string;
	email: string;
	status: UserStatusEnum;
	roles: string[];
	remark: string | null;
	created_at: Date;
	updated_at: Date;
}

export interface UserCreate {
	name: string;
	email: string;
	password: string;
	status?: UserStatusEnum;
	remark?: string;
	role_ids?: string[];
}

export interface UserDetail {
	id: string;
	name: string;
	email: string;
	status: UserStatusEnum;
	remark: string | null;
	roles: {
		id: string;
		name: string;
	}[];
	created_at: Date;
	updated_at: Date;
}

export interface UserForAuth {
	id: string;
	name: string;
	email: string;
	password: string;
	status: UserStatusEnum | null;
	email_verified_at: Date | null;
}

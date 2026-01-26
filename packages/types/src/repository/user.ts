import { UserStatusEnum } from "@repo/database";

export interface UserInformation {
	id: string;
	name: string;
	email: string;
	roles: string[];
	permissions: string[];
}

export type UserList = {
	id: string;
	name: string;
	email: string;
	status: UserStatusEnum;
	roles: string[];
	remark: string | null;
	created_at: Date;
	updated_at: Date;
};

export type UserCreate = {
	name: string;
	email: string;
	password: string;
	status?: UserStatusEnum;
	remark?: string;
	role_ids?: string[];
};

export type UserDetail = {
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
};

export type UserForAuth = {
	id: string;
	name: string;
	email: string;
	password: string;
	status: UserStatusEnum | null;
	email_verified_at: Date | null;
};

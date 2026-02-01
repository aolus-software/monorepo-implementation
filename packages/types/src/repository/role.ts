export type RoleList = {
	id: string;
	name: string;
	permissions_count: number;
	created_at: Date;
	updated_at: Date;
};

export type RoleDetail = {
	id: string;
	name: string;
	permissions: {
		id: string;
		name: string;
		group: string;
	}[];
	created_at: Date;
	updated_at: Date;
};

export type RoleWithPermissions = {
	id: string;
	name: string;
	permissions: {
		id: string;
		name: string;
		group: string;
		assigned: boolean;
	}[];
	created_at: Date;
	updated_at: Date;
};

export type RoleCreate = {
	name: string;
	permission_ids?: string[];
};

export type RoleUpdate = {
	name?: string;
	permission_ids?: string[];
};

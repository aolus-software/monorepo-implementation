export interface RoleList {
	id: string;
	name: string;
	permissions_count: number;
	created_at: Date;
	updated_at: Date;
}

export interface RoleDetail {
	id: string;
	name: string;
	permissions: {
		id: string;
		name: string;
		group: string;
	}[];
	created_at: Date;
	updated_at: Date;
}

export interface RoleWithPermissions {
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
}

export interface RoleCreate {
	name: string;
	permission_ids?: string[];
}

export interface RoleUpdate {
	name?: string;
	permission_ids?: string[];
}

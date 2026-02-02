export interface PermissionList {
	id: string;
	name: string;
	group: string;
	created_at: Date;
	updated_at: Date;
}

export interface PermissionDetail {
	id: string;
	name: string;
	group: string;
	created_at: Date;
	updated_at: Date;
}

export interface PermissionCreate {
	name: string;
	group: string;
}

export interface PermissionBulkCreate {
	group: string;
	names: string[];
}

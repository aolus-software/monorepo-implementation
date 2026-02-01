export type PermissionList = {
	id: string;
	name: string;
	group: string;
	created_at: Date;
	updated_at: Date;
};

export type PermissionDetail = {
	id: string;
	name: string;
	group: string;
	created_at: Date;
	updated_at: Date;
};

export type PermissionCreate = {
	name: string;
	group: string;
};

export type PermissionBulkCreate = {
	group: string;
	names: string[];
};

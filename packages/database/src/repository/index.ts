import type { ExtractTablesWithRelations } from "drizzle-orm";
import type {
	NodePgDatabase,
	NodePgQueryResultHKT,
} from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";

import type { schema } from "../schema";

export * from "./rbac.repository";
export * from "./user.repository";

export type DbTransaction = PgTransaction<
	NodePgQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

export type DbClient = NodePgDatabase<typeof schema> | DbTransaction;

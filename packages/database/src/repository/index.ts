import { ExtractTablesWithRelations } from "drizzle-orm";
import { NodePgDatabase, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { schema } from "src/schema";

export * from "./user.repository";
export * from "./rbac.repository";

export type DbTransaction = PgTransaction<
	NodePgQueryResultHKT,
	typeof schema,
	ExtractTablesWithRelations<typeof schema>
>;

export type DbClient = NodePgDatabase<typeof schema> | DbTransaction;

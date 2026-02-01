import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { schema } from "./schema/index";

export const getClient = (
	connectionString: string,
): NodePgDatabase<typeof schema> => {
	const poolClient = drizzle(connectionString, { schema });
	return poolClient;
};

import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "./schema/index";

export const getClient = (connectionString: string) => {
	const poolClient = drizzle(connectionString, { schema });
	return poolClient;
};

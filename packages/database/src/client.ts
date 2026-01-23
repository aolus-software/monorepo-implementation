import { drizzle } from "drizzle-orm/node-postgres";
import { databaseEnvSchema } from "@repo/env";
import { schema } from "./schema/index";

const env = databaseEnvSchema.parse(process.env);

const db = drizzle(env.DATABASE_URL, { schema });
const pool = db.$client;

export { db, pool };

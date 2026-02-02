import { getClient } from "@repo/database";

import { env } from "./env";

export const db = getClient(env.DATABASE_URL);

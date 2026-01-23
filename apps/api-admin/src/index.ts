import { apiEnvSchema } from "@repo/env";
import Elysia from "elysia";

const env = apiEnvSchema.parse(process.env);
const app = new Elysia().listen(env.PORT);

console.log(`🦊 Admin API running at http://localhost:${env.PORT}`);

export default app.fetch;

import { Elysia } from "elysia";
import { apiEnvSchema } from "@repo/env";

const env = apiEnvSchema.parse(process.env);

const app = new Elysia().listen(env.PORT);

console.log(`🦊 Admin API running at http://localhost:${env.PORT}`);

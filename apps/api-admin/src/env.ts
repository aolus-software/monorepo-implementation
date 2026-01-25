import { apiEnvSchema } from "@repo/env";

export const env = apiEnvSchema.parse(process.env);

import { apiEnvSchema } from "@repo/env";
import Elysia from "elysia";
import { bootstraps } from "./modules";
import { DocsPlugin } from "@repo/elysia";

const env = apiEnvSchema.parse(process.env);
const app = new Elysia()
	.use(
		DocsPlugin({
			appName: env.APP_NAME,
			enable: env.NODE_ENV !== "production",
		}),
	)
	.use(bootstraps)
	.listen(env.PORT);

// eslint-disable-next-line no-console
console.log(`🦊 Admin API running at http://localhost:${env.PORT}`);

export default app.fetch;

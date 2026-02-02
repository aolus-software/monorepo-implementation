import { DocsPlugin } from "@repo/elysia";
import Elysia from "elysia";

import { env } from "./env";
import { bootstraps } from "./modules";

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
console.log(`🦊 User API running at http://localhost:${env.PORT}`);

export default app.fetch;

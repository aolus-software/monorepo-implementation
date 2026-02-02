import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";

interface DocsPluginOptions {
	enable: boolean;
	appName: string;
}

export const DocsPlugin = (
	options: DocsPluginOptions = {
		enable: true,
		appName: "Elysia App",
	},
): Elysia => {
	return new Elysia({ name: "docs" }).use(
		openapi({
			path: "/docs",
			enabled: options.enable,
			documentation: {
				info: {
					title: `API ${options.appName}`,
					version: "1.0.0",
					description: `API documentation for ${options.appName}`,
					license: {
						name: "MIT",
						url: "https://opensource.org/license/mit/",
					},
					contact: {},
				},
				security: [{ bearerAuth: [] }],
				components: {
					securitySchemes: {
						bearerAuth: {
							type: "http",
							scheme: "bearer",
							bearerFormat: "JWT",
						},
					},
				},
			},
		}),
	);
};

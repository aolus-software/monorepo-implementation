import { baseConfig } from "@repo/config/eslint.config.mjs";

export default [
	...baseConfig,
	{
		ignores: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			"**/.next/**",
			"**/out/**",
		],
	},
];

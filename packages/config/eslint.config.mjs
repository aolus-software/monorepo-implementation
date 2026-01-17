// @ts-check
import eslint from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
	{
		ignores: [
			"eslint.config.mjs",
			"eslint.config.js",
			"dist/**/*",
			"build/**/*",
			".next/**/*",
			"node_modules/**/*",
			"**/*.interface.ts",
			"**/interface/**/*",
			"**/interfaces/**/*",
		],
	},

	// Base ESLint recommended
	eslint.configs.recommended,

	// TypeScript strict + stylistic
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.stylisticTypeChecked,

	// Prettier
	eslintPluginPrettierRecommended,

	{
		plugins: {
			"simple-import-sort": simpleImportSort,
			import: importPlugin,
		},

		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
				Bun: "readonly",
			},
			ecmaVersion: 2022,
			sourceType: "module",
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},

		rules: {
			//
			// ---- TypeScript Strict Rules ----
			//
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-floating-promises": "error",
			"@typescript-eslint/no-unsafe-argument": "error",
			"@typescript-eslint/no-unsafe-assignment": "error",
			"@typescript-eslint/no-unsafe-call": "error",
			"@typescript-eslint/no-unsafe-member-access": "error",
			"@typescript-eslint/no-unsafe-return": "error",
			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
					allowHigherOrderFunctions: true,
				},
			],
			"@typescript-eslint/explicit-module-boundary-types": "error",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					caughtErrorsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-empty-function": "error",
			"@typescript-eslint/no-empty-interface": "error",
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
					fixStyle: "separate-type-imports",
				},
			],
			"@typescript-eslint/consistent-type-exports": [
				"error",
				{
					fixMixedExportsWithInlineTypeSpecifier: true,
				},
			],
			"@typescript-eslint/no-misused-promises": [
				"error",
				{
					checksVoidReturn: {
						attributes: false,
					},
				},
			],
			"@typescript-eslint/require-await": "error",
			"@typescript-eslint/await-thenable": "error",
			"@typescript-eslint/no-unnecessary-type-assertion": "error",
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{
					allowNumber: true,
					allowBoolean: true,
					allowNullish: false,
				},
			],

			//
			// ---- Import Sorting & Organization ----
			//
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"import/first": "error",
			"import/newline-after-import": "error",
			"import/no-duplicates": "error",
			"import/no-unresolved": "off", // TypeScript handles this

			//
			// ---- General JS Rules ----
			//
			"no-unused-expressions": "error",
			"no-console": ["warn", { allow: ["warn", "error"] }],
			"no-undef": "off", // TypeScript handles this
			"no-redeclare": "off", // TypeScript handles this
			"@typescript-eslint/no-redeclare": "error",
			"no-shadow": "off",
			"@typescript-eslint/no-shadow": "error",
			"prefer-const": "error",
			"no-var": "error",
			eqeqeq: ["error", "always"],

			//
			// ---- Code Quality ----
			//
			"no-throw-literal": "off",
			"@typescript-eslint/only-throw-error": "error",
			"@typescript-eslint/no-unnecessary-condition": "warn",
			"@typescript-eslint/prefer-nullish-coalescing": "warn",
			"@typescript-eslint/prefer-optional-chain": "error",
		},
	},
);

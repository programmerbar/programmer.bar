import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

export default [
	js.configs.recommended,
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
				ecmaFeatures: {
					jsx: true
				}
			},
			globals: {
				...globals.node
			}
		},
		plugins: {
			"@typescript-eslint": tseslint
		},
		rules: {
			...tseslint.configs.recommended.rules,
			"@typescript-eslint/no-unused-vars": "error",
			"@typescript-eslint/no-explicit-any": "warn",
			"prefer-const": "error",
			"no-var": "error"
		}
	},
	{
		ignores: ["node_modules/**", ".react-email/**"]
	}
];

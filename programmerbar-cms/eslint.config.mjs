import typescript from "typescript-eslint";

export default [
	...typescript.configs.recommended,
	{
		ignores: ["node_modules/**", ".sanity/**", "dist/**"]
	}
];

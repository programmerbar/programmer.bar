import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/server/db/schemas/index.ts',
	out: './migrations',
	driver: 'd1-http',
	casing: 'snake_case',

	dbCredentials: {
		accountId: 'account-id',
		databaseId: 'database-id',
		token: 'token'
	}
});

import { sqliteTable, text, integer, index, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { users } from './users';

export const unavailability = sqliteTable(
	'unavailability',
	{
		id: text().primaryKey().$defaultFn(nanoid),
		userId: text()
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		startAt: integer({ mode: 'timestamp' }).notNull(),
		endAt: integer({ mode: 'timestamp' }).notNull(),
		groupId: text(),
		groupLabel: text()
	},
	(table) => [
		index('unavailability_user_id_idx').on(table.userId),
		check('unavailability_valid_interval', sql`${table.endAt} > ${table.startAt}`)
	]
);

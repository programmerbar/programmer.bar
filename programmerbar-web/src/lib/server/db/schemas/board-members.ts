import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { BoardMemberInput, Period } from '../../../board-history';

export const boardMembers = sqliteTable('board_member', {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	category: text({ enum: ['current', 'past', 'founder'] }).notNull(),
	membership: text({ mode: 'json' }).$type<Period>(),
	roles: text({ mode: 'json' }).$type<BoardMemberInput['roles']>().notNull(),
	sortOrder: integer().notNull().default(0),
	revision: integer().notNull().default(1)
});

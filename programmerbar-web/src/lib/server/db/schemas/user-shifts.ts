import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';
import { shifts } from './shifts';
import { users } from './users';

export const userShifts = sqliteTable(
	'user_shift',
	{
		userId: text()
			.notNull()
			.references(() => users.id, {
				onDelete: 'cascade'
			}),
		shiftId: text()
			.notNull()
			.references(() => shifts.id, {
				onDelete: 'cascade'
			}),
		createdAt: integer({ mode: 'timestamp' })
			.notNull()
			.$defaultFn(() => new Date()),
		updatedAt: integer({ mode: 'timestamp' }),
		isBeerClaimed: integer({ mode: 'boolean' }).notNull().default(false),
		status: text({ enum: ['accepted', 'denied'] })
			.notNull()
			.default('accepted')
	},
	(table) => [uniqueIndex('user_shift_user_id_shift_id_unique').on(table.userId, table.shiftId)]
);

export const userShiftsRelations = relations(userShifts, ({ one }) => ({
	user: one(users, {
		fields: [userShifts.userId],
		references: [users.id]
	}),
	shift: one(shifts, {
		fields: [userShifts.shiftId],
		references: [shifts.id]
	})
}));

export type UserShift = InferSelectModel<typeof userShifts>;
export type UserShiftInsert = InferInsertModel<typeof userShifts>;

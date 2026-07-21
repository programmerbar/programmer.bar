import type { Database } from '$lib/server/db/drizzle';
import { events, shifts, userShifts } from '$lib/server/db/schemas';
import { eq, and, lte, gte, inArray, asc } from 'drizzle-orm';

export class ShiftService {
	#db: Database;

	constructor(db: Database) {
		this.#db = db;
	}

	async findCompletedShiftsByUserId(userId: string) {
		const completedShifts = await this.#db
			.select()
			.from(shifts)
			.leftJoin(userShifts, eq(shifts.id, userShifts.shiftId))
			.where(
				and(
					eq(userShifts.userId, userId),
					eq(userShifts.status, 'accepted'),
					lte(shifts.endAt, new Date())
				)
			);

		return completedShifts.map((shifts) => shifts.shift);
	}

	async findUsersWithCompletedShiftsByUserIds(userIds: Array<string>) {
		if (userIds.length === 0) {
			return [];
		}

		const usersWithCompletedShifts = await this.#db
			.select({ userId: userShifts.userId })
			.from(shifts)
			.leftJoin(userShifts, eq(shifts.id, userShifts.shiftId))
			.where(
				and(
					inArray(userShifts.userId, userIds),
					eq(userShifts.status, 'accepted'),
					lte(shifts.endAt, new Date())
				)
			)
			.groupBy(userShifts.userId);

		return usersWithCompletedShifts.map((row) => row.userId);
	}

	async findUpcomingShiftsByUserId(userId: string) {
		const upcomingShifts = await this.#db
			.select()
			.from(shifts)
			.leftJoin(userShifts, eq(shifts.id, userShifts.shiftId))
			.leftJoin(events, eq(shifts.eventId, events.id))
			.where(
				and(
					eq(userShifts.userId, userId),
					// eq(userShifts.status, 'accepted'), // Uncomment this line when we can accept shifts
					gte(shifts.startAt, new Date())
				)
			)
			.orderBy(asc(shifts.startAt));

		return upcomingShifts;
	}

	async findShiftsWithUnclaimedBeersByUserId(userId: string) {
		const shiftsWithUnclaimedBeer = await this.#db
			.select()
			.from(shifts)
			.leftJoin(userShifts, eq(shifts.id, userShifts.shiftId))
			.where(
				and(
					eq(userShifts.userId, userId),
					// eq(userShifts.status, 'accepted'), // Uncomment this line when we can accept shifts
					eq(userShifts.isBeerClaimed, false),
					lte(shifts.endAt, new Date())
				)
			);

		return shiftsWithUnclaimedBeer;
	}
}

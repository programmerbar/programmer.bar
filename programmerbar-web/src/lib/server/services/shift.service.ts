import type { Database } from '$lib/server/db/drizzle';
import { events, shifts, userShifts, unavailability, users } from '../db/schemas';
import { findPlanningConflict, overlaps, type PlannedShift } from '../../shift-planning';
import { error } from '@sveltejs/kit';
import { eq, and, lte, gte, inArray, asc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export class ShiftService {
	#db: Database;

	constructor(db: Database) {
		this.#db = db;
	}

	async planningData(excludeEventId?: string) {
		const [assignments, absences, volunteers] = await Promise.all([
			this.#db
				.select({
					userId: userShifts.userId,
					shiftId: shifts.id,
					eventId: shifts.eventId,
					startAt: shifts.startAt,
					endAt: shifts.endAt
				})
				.from(userShifts)
				.innerJoin(shifts, eq(shifts.id, userShifts.shiftId))
				.where(eq(userShifts.status, 'accepted')),
			this.#db.select().from(unavailability),
			this.#db
				.select({ id: users.id, name: users.name, role: users.role })
				.from(users)
				.where(eq(users.isDeleted, false))
		]);
		return {
			assignments: assignments.filter((shift) => shift.eventId !== excludeEventId),
			absences,
			// Draw once per page load; reuse on the client when filtering and editing shifts.
			volunteers: volunteers.map((user) => ({ ...user, tieBreaker: Math.random() })),
			now: new Date()
		};
	}

	async assertAvailable(planned: PlannedShift[], excludeEventId?: string) {
		const { assignments, absences } = await this.planningData(excludeEventId);
		const conflict = findPlanningConflict(planned, assignments, absences);
		if (conflict) error(400, conflict);
	}

	async findAbsences(userId: string) {
		return this.#db
			.select()
			.from(unavailability)
			.where(eq(unavailability.userId, userId))
			.orderBy(asc(unavailability.startAt));
	}

	async addAbsence(userId: string, period: { startAt: Date; endAt: Date }) {
		const assigned = await this.#db
			.select({ startAt: shifts.startAt, endAt: shifts.endAt })
			.from(userShifts)
			.innerJoin(shifts, eq(shifts.id, userShifts.shiftId))
			.where(and(eq(userShifts.userId, userId), eq(userShifts.status, 'accepted')));
		await this.#db.insert(unavailability).values({ userId, ...period });
		return assigned.some((shift) => overlaps(shift, period));
	}

	async deleteAbsence(userId: string, id: string) {
		return this.#db
			.delete(unavailability)
			.where(and(eq(unavailability.id, id), eq(unavailability.userId, userId)))
			.returning();
	}

	async addAbsences(
		userId: string,
		periods: { startAt: Date; endAt: Date }[],
		groupLabel = 'Faste ukedager'
	) {
		if (!periods.length) return false;
		const assigned = await this.#db
			.select({ startAt: shifts.startAt, endAt: shifts.endAt })
			.from(userShifts)
			.innerJoin(shifts, eq(shifts.id, userShifts.shiftId))
			.where(and(eq(userShifts.userId, userId), eq(userShifts.status, 'accepted')));
		const groupId = nanoid();
		const insertChunk = (chunk: typeof periods) =>
			this.#db
				.insert(unavailability)
				.values(chunk.map((period) => ({ userId, ...period, groupId, groupLabel })));
		// Keep each statement below D1's parameter limit. The batch is atomic.
		const first = insertChunk(periods.slice(0, 16));
		const rest = [];
		for (let i = 16; i < periods.length; i += 16) rest.push(insertChunk(periods.slice(i, i + 16)));
		await this.#db.batch([first, ...rest]);
		return assigned.some((shift) => periods.some((period) => overlaps(shift, period)));
	}

	async deleteAbsenceGroup(userId: string, groupId: string) {
		return this.#db
			.delete(unavailability)
			.where(and(eq(unavailability.userId, userId), eq(unavailability.groupId, groupId)))
			.returning();
	}

	async deleteAbsences(userId: string, ids: string[]) {
		const uniqueIds = [...new Set(ids)];
		if (!uniqueIds.length) return [];
		const deletion = (chunk: string[]) =>
			this.#db
				.delete(unavailability)
				.where(and(eq(unavailability.userId, userId), inArray(unavailability.id, chunk)))
				.returning();
		const first = deletion(uniqueIds.slice(0, 80));
		const rest = [];
		for (let i = 80; i < uniqueIds.length; i += 80) rest.push(deletion(uniqueIds.slice(i, i + 80)));
		return (await this.#db.batch([first, ...rest])).flat();
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

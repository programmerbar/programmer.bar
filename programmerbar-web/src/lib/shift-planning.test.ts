import { describe, expect, it } from 'vitest';
import {
	findPlanningConflict,
	overlaps,
	rankVolunteers,
	shiftStatistics,
	semesterFor,
	assignmentsInSemester,
	type Assignment
} from './shift-planning';
import { availabilitySchema } from './validators/availability';

const now = new Date('2026-10-01T12:00:00Z');
const target = {
	startAt: new Date('2026-10-09T16:00:00Z'),
	endAt: new Date('2026-10-09T20:00:00Z')
};
const volunteer = (id: string, role = 'normal') => ({ id, name: id, role });
const assignment = (userId: string, start: string, end: string): Assignment => ({
	userId,
	shiftId: start,
	eventId: 'event',
	startAt: new Date(start),
	endAt: new Date(end)
});

describe('shift recommendations', () => {
	it('breaks equal counts and distances using the saved random draw instead of name', () => {
		const people = [
			{ ...volunteer('Anna'), tieBreaker: 0.8 },
			{ ...volunteer('Zara'), tieBreaker: 0.2 }
		];
		const shifts = [
			assignment('Anna', '2026-08-01T16:00Z', '2026-08-01T20:00Z'),
			assignment('Zara', '2026-08-01T16:00Z', '2026-08-01T20:00Z')
		];
		const ranked = rankVolunteers(people, shifts, [], target, now);
		expect(ranked[0].completed).toBe(ranked[1].completed);
		expect(ranked[0].nearestShiftDistance).toBe(ranked[1].nearestShiftDistance);
		expect(ranked.map((user) => user.id)).toEqual(['Zara', 'Anna']);
		expect(rankVolunteers([...people].reverse(), shifts, [], target, now)).toEqual(ranked);
		expect(
			rankVolunteers(
				people.map((user) => ({ ...user, tieBreaker: 1 - user.tieBreaker })),
				shifts,
				[],
				target,
				now
			).map((user) => user.id)
		).toEqual(['Anna', 'Zara']);
	});

	it('always prioritizes completed count before the random draw', () => {
		const people = [
			{ ...volunteer('new'), tieBreaker: 0.99 },
			{ ...volunteer('experienced'), tieBreaker: 0 }
		];
		const shifts = [assignment('experienced', '2026-08-01T16:00Z', '2026-08-01T20:00Z')];
		expect(rankVolunteers(people, shifts, [], target, now).map((user) => user.id)).toEqual([
			'new',
			'experienced'
		]);
	});
	it('ignores previous semesters for workload, recency and tie-breaking', () => {
		const january = {
			startAt: new Date('2027-01-02T16:00Z'),
			endAt: new Date('2027-01-02T20:00Z')
		};
		const people = [volunteer('a'), volunteer('b')];
		const previous = [
			assignment('a', '2026-12-31T16:00Z', '2026-12-31T20:00Z'),
			assignment('a', '2026-12-25T16:00Z', '2026-12-25T20:00Z'),
			assignment('b', '2026-06-25T16:00Z', '2026-06-25T20:00Z')
		];
		expect(rankVolunteers(people, previous, [], january, now)).toEqual(
			rankVolunteers(people, [], [], january, now)
		);
	});

	it('uses the target semester rather than the current semester and keeps cross-semester conflicts', () => {
		const january = {
			startAt: new Date('2026-12-31T23:00Z'),
			endAt: new Date('2027-01-01T03:00Z')
		};
		const rows = rankVolunteers(
			[volunteer('a')],
			[
				assignment('a', '2026-12-31T22:00Z', '2027-01-01T02:00Z'),
				assignment('a', '2027-01-05T16:00Z', '2027-01-05T20:00Z')
			],
			[],
			january,
			now
		);
		expect(rows[0].upcoming).toBe(1);
		expect(rows[0].busy).toBe(true);
	});

	it('counts shifts by their start in Norwegian time at both semester boundaries', () => {
		expect(semesterFor(new Date('2026-06-30T21:59Z')).id).toBe('2026-1');
		expect(semesterFor(new Date('2026-06-30T22:00Z')).id).toBe('2026-2');
		expect(semesterFor(new Date('2026-12-31T23:00Z')).id).toBe('2027-1');
		const shifts = [
			assignment('a', '2026-06-30T21:00Z', '2026-07-01T02:00Z'),
			assignment('a', '2026-06-30T22:00Z', '2026-07-01T03:00Z'),
			assignment('a', '2026-12-31T23:00Z', '2027-01-01T03:00Z')
		];
		expect(assignmentsInSemester(shifts, semesterFor(now))).toEqual([shifts[1]]);
	});
	it('prioritizes volunteers with fewer shifts, including those with no history', () => {
		const rows = rankVolunteers(
			[volunteer('experienced'), volunteer('new')],
			[assignment('experienced', '2026-09-01T16:00Z', '2026-09-01T20:00Z')],
			[],
			target,
			now
		);
		expect(rows.map((row) => row.id)).toEqual(['new', 'experienced']);
	});
	it('prioritizes fewer completed shifts even with a shift the previous week', () => {
		const rows = rankVolunteers(
			[volunteer('recent'), volunteer('rested')],
			[
				assignment('recent', '2026-10-02T16:00Z', '2026-10-02T20:00Z'),
				assignment('rested', '2026-09-01T16:00Z', '2026-09-01T20:00Z'),
				assignment('rested', '2026-09-08T16:00Z', '2026-09-08T20:00Z')
			],
			[],
			target,
			new Date('2026-10-08T12:00Z')
		);
		expect(rows.map((row) => row.id)).toEqual(['recent', 'rested']);
		expect(rows[0].recent).toBe(true);
	});
	it('uses distance beyond 14 days before random draws when completed counts match', () => {
		const rows = rankVolunteers(
			[
				{ ...volunteer('near'), tieBreaker: 0 },
				{ ...volunteer('far'), tieBreaker: 0.9 }
			],
			[
				assignment('near', '2026-09-01T16:00Z', '2026-09-01T20:00Z'),
				assignment('far', '2026-08-01T16:00Z', '2026-08-01T20:00Z')
			],
			[],
			target,
			now
		);
		expect(rows.map((row) => row.id)).toEqual(['far', 'near']);
	});
	it('uses the nearest future or past shift but counts only completed shifts first', () => {
		const rows = rankVolunteers(
			[volunteer('future'), volunteer('past')],
			[
				assignment('future', '2026-08-01T16:00Z', '2026-08-01T20:00Z'),
				assignment('future', '2026-10-10T16:00Z', '2026-10-10T20:00Z'),
				assignment('past', '2026-09-25T16:00Z', '2026-09-25T20:00Z'),
				assignment('past', '2026-11-01T16:00Z', '2026-11-01T20:00Z'),
				assignment('past', '2026-11-08T16:00Z', '2026-11-08T20:00Z')
			],
			[],
			target,
			now
		);
		expect(rows.map((row) => row.id)).toEqual(['past', 'future']);
		expect(rows.map((row) => row.completed)).toEqual([1, 1]);
		expect(rows[1].nearestShiftDistance).toBe(20 * 60 * 60 * 1000);
	});
	it('uses saved random draws when neither volunteer has any shifts', () => {
		const rows = rankVolunteers(
			[
				{ ...volunteer('a'), tieBreaker: 0.9 },
				{ ...volunteer('b'), tieBreaker: 0.1 }
			],
			[],
			[],
			target,
			now
		);
		expect(rows.map((row) => row.id)).toEqual(['b', 'a']);
	});
	it('flags absence and overlapping assignments while retaining board for manual selection', () => {
		const rows = rankVolunteers(
			[
				volunteer('absent'),
				volunteer('busy'),
				volunteer('board', 'board'),
				volunteer('inactive', 'inactive')
			],
			[{ ...target, userId: 'busy', shiftId: 'other', eventId: 'other' }],
			[{ ...target, userId: 'absent' }],
			target,
			now
		);
		expect(rows.find((row) => row.id === 'absent')?.unavailable).toBe(true);
		expect(rows.find((row) => row.id === 'busy')?.busy).toBe(true);
		expect(rows.find((row) => row.id === 'board')?.role).toBe('board');
		expect(rows.some((row) => row.id === 'inactive')).toBe(false);
		expect(rows.filter((row) => row.role === 'normal' && !row.busy && !row.unavailable)).toEqual(
			[]
		);
	});
	it('counts completed and upcoming separately and uses only completed shifts for last shift', () => {
		const past = assignment('a', '2026-09-01T16:00Z', '2026-09-01T20:00Z');
		const future = assignment('a', '2026-10-02T16:00Z', '2026-10-02T20:00Z');
		expect(shiftStatistics('a', [past, future], now)).toEqual({
			completed: 1,
			upcoming: 1,
			lastShift: past.endAt
		});
		expect(shiftStatistics('new', [past, future], now)).toEqual({
			completed: 0,
			upcoming: 0,
			lastShift: null
		});
	});
});

describe('availability conflicts', () => {
	it('allows touching boundaries but rejects partial and enclosing overlaps', () => {
		expect(overlaps(target, { startAt: target.endAt, endAt: new Date('2026-10-09T23:00Z') })).toBe(
			false
		);
		expect(
			overlaps(target, {
				startAt: new Date('2026-10-09T19:00Z'),
				endAt: new Date('2026-10-10T02:00Z')
			})
		).toBe(true);
		expect(
			overlaps(target, {
				startAt: new Date('2026-10-08T00:00Z'),
				endAt: new Date('2026-10-11T00:00Z')
			})
		).toBe(true);
	});
	it('rejects absences, existing assignments and conflicts within the same unsaved event', () => {
		const planned = [{ ...target, users: ['a'] }];
		expect(findPlanningConflict(planned, [], [{ ...target, userId: 'a' }])).toContain(
			'ikke kan stå'
		);
		expect(
			findPlanningConflict(planned, [{ ...target, userId: 'a', shiftId: 's', eventId: 'e' }], [])
		).toContain('overlapper');
		expect(findPlanningConflict([...planned, ...planned], [], [])).toContain('overlapper');
		expect(findPlanningConflict(planned, [], [{ ...target, userId: 'b' }])).toBeNull();
	});
	it('validates intervals and converts Norwegian local time across midnight and daylight saving', () => {
		const parsed = availabilitySchema.parse({
			startAt: '2026-10-24T23:00',
			endAt: '2026-10-25T04:00'
		});
		expect(parsed.startAt.toISOString()).toBe('2026-10-24T21:00:00.000Z');
		expect(parsed.endAt.toISOString()).toBe('2026-10-25T03:00:00.000Z');
		for (const value of [
			{ startAt: 'bad', endAt: '2026-10-25T04:00' },
			{ startAt: '2026-10-25T04:00', endAt: '2026-10-25T04:00' },
			{ startAt: '2026-10-25T05:00', endAt: '2026-10-25T04:00' },
			{ startAt: '2026-03-29T02:30', endAt: '2026-03-29T04:00' }
		])
			expect(availabilitySchema.safeParse(value).success).toBe(false);
	});
});

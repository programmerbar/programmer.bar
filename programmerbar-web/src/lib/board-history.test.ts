import { describe, expect, it } from 'vitest';
import {
	boardMemberSchema,
	getBoardYears,
	overlapsYear,
	sortByFirstMembership,
	visibleRoles,
	type BoardMemberInput
} from './board-history';

describe('board history display', () => {
	const member: BoardMemberInput = {
		name: 'Test',
		category: 'current',
		roles: [
			{ title: 'Assistent', period: { start: 'Høst 2025', end: 'Høst 2025' } },
			{ title: 'Ansvarlig', period: { start: 'Vår 2026' } },
			{ title: 'Fremtidig verv', period: { start: 'Vår 2027' } }
		]
	};
	it('puts unknown dates first then sorts by the earliest known start without mutating input', () => {
		const list: BoardMemberInput[] = [
			{ name: 'Ukjent', category: 'past', roles: [], membership: { end: 'Vår 2025' } },
			{ name: 'Ny', category: 'current', roles: [], membership: { start: 'Høst 2026' } },
			{ ...member, membership: { start: 'Høst 2026' } }
		];
		expect(sortByFirstMembership(list).map((entry) => entry.name)).toEqual([
			'Ukjent',
			'Test',
			'Ny'
		]);
		expect(list[0].name).toBe('Ukjent');
	});
	it('shows only active roles by default and expands the full history on request', () => {
		const now = new Date('2026-09-19T12:00:00Z');
		expect(visibleRoles(member, 'all', false, now).map((role) => role.title)).toEqual([
			'Ansvarlig'
		]);
		expect(visibleRoles(member, 'all', true, now)).toEqual(member.roles);
		expect(visibleRoles({ ...member, category: 'past' }, 'all', false, now)).toEqual(member.roles);
	});
	it('keeps year filtering independent of the current-role display', () => {
		expect(visibleRoles(member, '2025', false).map((role) => role.title)).toEqual([
			'Assistent',
			'Ansvarlig'
		]);
		expect(visibleRoles(member, '2026', true).map((role) => role.title)).toEqual([
			'Ansvarlig',
			'Fremtidig verv'
		]);
	});
});

describe('board history validation and periods', () => {
	it('allows unknown dates and overlapping roles', () => {
		expect(
			boardMemberSchema.safeParse({ name: 'Medlem', category: 'past', roles: [] }).success
		).toBe(true);
		expect(
			boardMemberSchema.safeParse({
				name: 'Medlem',
				category: 'current',
				roles: [
					{ title: 'Leder', period: { start: 'Høst 2025' } },
					{ title: 'Webansvarlig', period: { start: 'Høst 2025' } }
				]
			}).success
		).toBe(true);
	});

	it('rejects invalid semesters, backwards periods and current membership with an end', () => {
		for (const membership of [
			{ start: 'Sommer 2025' },
			{ start: 'Høst 2026', end: 'Vår 2026' },
			{ start: 'Høst 20250' }
		])
			expect(
				boardMemberSchema.safeParse({ name: 'Medlem', category: 'past', membership, roles: [] })
					.success
			).toBe(false);
		expect(
			boardMemberSchema.safeParse({
				name: 'Medlem',
				category: 'current',
				membership: { end: 'Vår 2026' },
				roles: []
			}).success
		).toBe(false);
		expect(
			boardMemberSchema.safeParse({
				name: 'Medlem',
				category: 'past',
				roles: [{ title: 'Leder', period: { start: 'Høst 2026', end: 'Vår 2025' } }]
			}).success
		).toBe(false);
	});

	it('filters completed roles and does not invent unknown membership boundaries', () => {
		expect(overlapsYear({ start: 'Høst 2025', end: 'Vår 2026' }, 2025, false)).toBe(true);
		expect(overlapsYear({ start: 'Høst 2025', end: 'Vår 2026' }, 2026, false)).toBe(false);
		expect(overlapsYear({ start: 'Høst 2025' }, 2026, true)).toBe(true);
		expect(overlapsYear({ start: 'Høst 2025' }, 2026, false)).toBe(false);
		expect(overlapsYear({ end: 'Vår 2026' }, 2024, false)).toBe(false);
		expect(overlapsYear(undefined, 2025, true)).toBe(false);
	});

	it('adds future board years when dates are registered', () => {
		expect(
			getBoardYears([
				{
					name: 'Medlem',
					category: 'past',
					membership: { start: 'Vår 2026', end: 'Høst 2027' },
					roles: []
				}
			])
		).toEqual([2027, 2026, 2025]);
		expect(getBoardYears([])).toEqual([]);
	});
});

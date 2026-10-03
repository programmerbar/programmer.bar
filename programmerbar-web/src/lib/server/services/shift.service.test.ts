import { readFileSync, readdirSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../db/drizzle';
import { ShiftService } from './shift.service';

describe('shift planning persistence', () => {
	let sqlite: DatabaseSync;
	let service: ShiftService;
	const period = { startAt: new Date('2026-10-09T16:00Z'), endAt: new Date('2026-10-09T20:00Z') };
	beforeEach(() => {
		// Historical Drizzle migrations use SQLite's legacy double-quoted string syntax.
		sqlite = new DatabaseSync(':memory:', { enableDoubleQuotedStringLiterals: true });
		const migrations = new URL('../../../../migrations/', import.meta.url);
		for (const file of readdirSync(migrations)
			.filter((file) => file.endsWith('.sql'))
			.sort()) {
			sqlite.exec(readFileSync(new URL(file, migrations), 'utf8'));
		}
		sqlite.exec(`INSERT INTO user (id, name, email, role) VALUES
			('a', 'Anna', 'a@example.com', 'normal'), ('b', 'Bjørn', 'b@example.com', 'board');`);
		const db = drizzle(
			async (query, params) => {
				const statement = sqlite.prepare(query);
				statement.setReturnArrays(true);
				return { rows: statement.all(...params) };
			},
			async (batch) => {
				sqlite.exec('BEGIN');
				try {
					const results = batch.map(({ sql, params }) => {
						expect(params.length).toBeLessThanOrEqual(100);
						const statement = sqlite.prepare(sql);
						statement.setReturnArrays(true);
						return { rows: statement.all(...params) };
					});
					sqlite.exec('COMMIT');
					return results;
				} catch (cause) {
					sqlite.exec('ROLLBACK');
					throw cause;
				}
			},
			{ casing: 'snake_case' }
		);
		service = new ShiftService(db as unknown as Database);
	});
	afterEach(() => sqlite.close());

	it('saves a large recurring selection in bounded statements and reports assigned shift conflicts', async () => {
		seedAssignments();
		const periods = Array.from({ length: 60 }, (_, index) => ({
			startAt: new Date(period.startAt.getTime() + index * 86400000),
			endAt: new Date(period.endAt.getTime() + index * 86400000)
		}));
		expect(await service.addAbsences('a', periods)).toBe(true);
		expect(await service.findAbsences('a')).toHaveLength(60);
		expect(await service.findAbsences('b')).toEqual([]);
	});

	it('rolls back the entire recurring selection if a later statement fails', async () => {
		await expect(
			service.addAbsences('a', [
				...Array.from({ length: 20 }, () => period),
				{ startAt: period.endAt, endAt: period.startAt }
			])
		).rejects.toThrow();
		expect(await service.findAbsences('a')).toEqual([]);
	});

	function seedAssignments() {
		sqlite.exec(`INSERT INTO event (id, name, date) VALUES ('event', 'Bar', 1791561600);
			INSERT INTO shift (id, event_id, start_at, end_at) VALUES ('shift', 'event', ${period.startAt.getTime() / 1000}, ${period.endAt.getTime() / 1000});
			INSERT INTO user_shift (user_id, shift_id, created_at, status) VALUES ('a', 'shift', 1, 'accepted'), ('b', 'shift', 1, 'denied');`);
	}

	it('persists absences and prevents another user from reading or deleting them', async () => {
		expect(await service.addAbsence('a', period)).toBe(false);
		const [absence] = await service.findAbsences('a');
		expect(absence).toMatchObject(period);
		expect(await service.findAbsences('b')).toEqual([]);
		expect(await service.deleteAbsence('b', absence.id)).toEqual([]);
		expect(await service.findAbsences('a')).toHaveLength(1);
		expect(await service.deleteAbsence('a', absence.id)).toHaveLength(1);
	});

	it('counts only accepted assignments and excludes the edited event when planning', async () => {
		seedAssignments();
		const planning = await service.planningData();
		expect(planning.assignments).toEqual([
			{ ...period, userId: 'a', shiftId: 'shift', eventId: 'event' }
		]);
		expect((await service.planningData('event')).assignments).toEqual([]);
		await expect(service.assertAvailable([{ ...period, users: ['a'] }])).rejects.toMatchObject({
			status: 400
		});
		await expect(
			service.assertAvailable([{ ...period, users: ['a'] }], 'event')
		).resolves.toBeUndefined();
	});

	it('retains an existing assignment when absence is registered and detects the conflict', async () => {
		seedAssignments();
		expect(await service.addAbsence('a', period)).toBe(true);
		expect((await service.planningData()).assignments).toHaveLength(1);
		await expect(
			service.assertAvailable([{ ...period, users: ['a'] }], 'event')
		).rejects.toMatchObject({ status: 400 });
	});

	it('enforces valid intervals at the database level', () => {
		expect(() =>
			sqlite.exec(
				"INSERT INTO unavailability (id, user_id, start_at, end_at) VALUES ('bad', 'a', 10, 5)"
			)
		).toThrow();
	});
});

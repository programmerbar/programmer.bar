import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Database } from '../db/drizzle';
import { STATUS, StatusService } from './status.service';

describe('automatic bar status', () => {
	let sqlite: DatabaseSync;
	let service: StatusService;

	beforeEach(() => {
		sqlite = new DatabaseSync(':memory:');
		sqlite.exec('CREATE TABLE shift (event_id TEXT, start_at INTEGER, end_at INTEGER)');
		const db = drizzle(
			async (query, params) => {
				const statement = sqlite.prepare(query);
				statement.setReturnArrays(true);
				return { rows: statement.all(...params) };
			},
			undefined,
			{ casing: 'snake_case' }
		);
		const values = new Map<string, string>();
		const kv = {
			get: async (key: string) => values.get(key) ?? null,
			put: async (key: string, value: string) => {
				values.set(key, value);
			},
			delete: async (key: string) => {
				values.delete(key);
			}
		} as unknown as KVNamespace;
		service = new StatusService(kv, db as unknown as Database);
	});

	afterEach(() => sqlite.close());

	function addShift(event: string, start: string, end: string) {
		sqlite
			.prepare('INSERT INTO shift VALUES (?, ?, ?)')
			.run(event, Date.parse(start) / 1000, Date.parse(end) / 1000);
	}

	it('is closed without shifts', async () => {
		expect(await service.get()).toBe(STATUS.CLOSED);
	});

	it('opens at the first start, stays open across gaps and midnight, and closes at the last end', async () => {
		addShift('a', '2026-09-18T18:00:00+02:00', '2026-09-18T20:00:00+02:00');
		addShift('a', '2026-09-18T21:00:00+02:00', '2026-09-19T02:00:00+02:00');
		for (const [time, expected] of [
			['2026-09-18T17:59:59+02:00', STATUS.CLOSED],
			['2026-09-18T18:00:00+02:00', STATUS.OPEN],
			['2026-09-18T20:30:00+02:00', STATUS.OPEN],
			['2026-09-19T01:59:59+02:00', STATUS.OPEN],
			['2026-09-19T02:00:00+02:00', STATUS.CLOSED]
		] as const) {
			expect(await service.get(new Date(time))).toBe(expected);
		}
	});

	it('does not open in the gap between separate events', async () => {
		addShift('a', '2026-09-18T18:00:00Z', '2026-09-18T20:00:00Z');
		addShift('b', '2026-09-18T21:00:00Z', '2026-09-18T23:00:00Z');
		expect(await service.get(new Date('2026-09-18T20:30:00Z'))).toBe(STATUS.CLOSED);
	});

	it('supports manual overrides and returning to automatic mode', async () => {
		for (const status of [STATUS.OPEN, STATUS.PRIVATE, STATUS.CLOSED]) {
			await service.set(status);
			expect(await service.get()).toBe(status);
		}
		await service.setAutomatic();
		expect(await service.getOverride()).toBeNull();
		expect(await service.get()).toBe(STATUS.CLOSED);
	});
});

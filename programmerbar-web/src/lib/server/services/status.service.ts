import z from 'zod';
import type { Database } from '../db/drizzle';
import { shifts } from '../db/schemas/shifts';
import { sql } from 'drizzle-orm';

// A new key makes automatic scheduling the default, ignoring the old static status.
const OVERRIDE_KEY = 'status-override';

export const STATUS = {
	CLOSED: 0,
	OPEN: 1,
	PRIVATE: 2
} as const;

export class StatusService {
	#kv: KVNamespace;
	#db: Database;

	constructor(kv: KVNamespace, db: Database) {
		this.#kv = kv;
		this.#db = db;
	}

	async getOverride() {
		const value = await this.#kv.get(OVERRIDE_KEY);
		return value === null ? null : Number(value);
	}

	async get(now = new Date()) {
		const override = await this.getOverride();
		if (override !== null) return override;

		// Compare Unix seconds, matching Drizzle's timestamp storage. Grouping keeps
		// the bar open between shifts belonging to the same event, also past midnight.
		const timestamp = Math.floor(now.getTime() / 1000);
		const activeEvents = await this.#db
			.select({ eventId: shifts.eventId })
			.from(shifts)
			.groupBy(shifts.eventId)
			.having(sql`min(${shifts.startAt}) <= ${timestamp} and max(${shifts.endAt}) > ${timestamp}`)
			.limit(1);
		return activeEvents.length > 0 ? STATUS.OPEN : STATUS.CLOSED;
	}

	async setAutomatic() {
		await this.#kv.delete(OVERRIDE_KEY);
	}

	async set(status: number) {
		await this.#kv.put(OVERRIDE_KEY, String(status));
	}

	async getWithMessage() {
		const status = await this.get();
		return {
			code: status,
			message: StatusService.getMessage(status)
		};
	}

	static getMessage(status: number) {
		switch (status) {
			case STATUS.CLOSED:
				return 'Baren er nå stengt! 🚪';
			case STATUS.OPEN:
				return 'Baren er nå åpen! 🍻';
			case STATUS.PRIVATE:
				return 'Lukket arrangement. 🎉';
			default:
				return 'Ukjent status.';
		}
	}

	static validateStatus(json: unknown) {
		return z
			.object({
				status: z.number().int().min(0).max(2)
			})
			.safeParse(json);
	}
}

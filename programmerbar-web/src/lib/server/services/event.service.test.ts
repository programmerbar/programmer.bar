import { describe, expect, it, vi } from 'vitest';
import type { Database } from '../db/drizzle';

vi.mock('$lib/server/db/schemas', () => ({ events: {}, shifts: {}, userShifts: {} }));

import { EventService } from './event.service';

describe('volunteer assignments', () => {
	function setup(eligible: { id: string }[]) {
		const values = vi.fn().mockResolvedValue(undefined);
		const insert = vi.fn().mockReturnValue({ values });
		const findMany = vi.fn().mockResolvedValue(eligible);
		const db = { query: { users: { findMany } }, insert } as unknown as Database;
		return { service: new EventService(db), insert, values, findMany };
	}

	it('rejects the entire batch if a volunteer is inactive, deleted or missing', async () => {
		const { service, insert } = setup([{ id: 'active' }]);
		await expect(
			service.createUserShifts([
				{ userId: 'active', shiftId: 'shift' },
				{ userId: 'inactive', shiftId: 'shift' }
			])
		).rejects.toMatchObject({ status: 400 });
		expect(insert).not.toHaveBeenCalled();
	});

	it('blocks self-registration for an ineligible volunteer', async () => {
		const { service, insert } = setup([]);
		await expect(
			service.createUserShift({ userId: 'inactive', shiftId: 'shift', status: 'accepted' })
		).rejects.toMatchObject({ status: 400 });
		expect(insert).not.toHaveBeenCalled();
	});

	it('allows the same active volunteer on multiple shifts', async () => {
		const { service, values } = setup([{ id: 'active' }]);
		const assignments = [
			{ userId: 'active', shiftId: 'one' },
			{ userId: 'active', shiftId: 'two' }
		];
		await service.createUserShifts(assignments);
		expect(values).toHaveBeenCalledWith(assignments);
	});

	it('allows empty shifts without querying users', async () => {
		const { service, findMany, insert } = setup([]);
		await service.createUserShifts([]);
		expect(findMany).not.toHaveBeenCalled();
		expect(insert).not.toHaveBeenCalled();
	});
});

import { describe, expect, it, vi } from 'vitest';
import { actions } from './+page.server';

function setup(role: string | null, fields: Record<string, string> = {}) {
	const service = {
		create: vi.fn(),
		update: vi.fn().mockResolvedValue(true),
		delete: vi.fn().mockResolvedValue(true)
	};
	const event = {
		locals: { user: role ? { role } : null, boardHistoryService: service },
		request: new Request('https://example.test/emeritus', {
			method: 'POST',
			body: new URLSearchParams(fields)
		})
	};
	return { service, event };
}

describe('emeritus editor authorization and validation', () => {
	it.each([null, 'normal'])('blocks save and delete for %s', async (role) => {
		const { event, service } = setup(role);
		await expect(actions.save!(event as never)).rejects.toMatchObject({ status: 403 });
		await expect(actions.delete!(event as never)).rejects.toMatchObject({ status: 403 });
		expect(service.create).not.toHaveBeenCalled();
		expect(service.update).not.toHaveBeenCalled();
		expect(service.delete).not.toHaveBeenCalled();
	});

	it('validates submitted data before writes', async () => {
		for (const member of [
			'not json',
			JSON.stringify({ name: '', category: 'current', roles: [] })
		]) {
			const { event, service } = setup('board', { member });
			expect(await actions.save!(event as never)).toMatchObject({ status: 400 });
			expect(service.create).not.toHaveBeenCalled();
		}
	});

	it('allows board members to create and edit history', async () => {
		const input = { name: 'Testperson', category: 'current', roles: [] };
		const create = setup('board', { member: JSON.stringify(input) });
		expect(await actions.save!(create.event as never)).toEqual({ success: true });
		expect(create.service.create).toHaveBeenCalledWith(input);
		const edit = setup('board', { member: JSON.stringify(input), id: 'member-id', revision: '3' });
		expect(await actions.save!(edit.event as never)).toEqual({ success: true });
		expect(edit.service.update).toHaveBeenCalledWith('member-id', 3, input);
	});

	it('reports a stale edit and requires revision for deletion', async () => {
		const edit = setup('board', {
			member: JSON.stringify({ name: 'Testperson', category: 'past', roles: [] }),
			id: 'member-id',
			revision: '1'
		});
		edit.service.update.mockResolvedValue(false);
		expect(await actions.save!(edit.event as never)).toMatchObject({ status: 409 });
		const invalid = setup('board', { id: 'member-id' });
		expect(await actions.delete!(invalid.event as never)).toMatchObject({ status: 400 });
		expect(invalid.service.delete).not.toHaveBeenCalled();
		const valid = setup('board', { id: 'member-id', revision: '1' });
		expect(await actions.delete!(valid.event as never)).toEqual({ success: true });
		expect(valid.service.delete).toHaveBeenCalledWith('member-id', 1);
	});
});

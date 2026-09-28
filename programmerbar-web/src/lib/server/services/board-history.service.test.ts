import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { boardMemberSchema } from '../../board-history';
import type { Database } from '../db/drizzle';
import { BoardHistoryService } from './board-history.service';

describe('board history persistence', () => {
	let sqlite: DatabaseSync;
	let service: BoardHistoryService;
	beforeEach(() => {
		sqlite = new DatabaseSync(':memory:');
		sqlite.exec(
			readFileSync(
				new URL('../../../../migrations/0029_dear_mattie_franklin.sql', import.meta.url),
				'utf8'
			)
		);
		const db = drizzle(
			async (query, params) => {
				const statement = sqlite.prepare(query);
				statement.setReturnArrays(true);
				return { rows: statement.all(...params) };
			},
			undefined,
			{ casing: 'snake_case' }
		);
		service = new BoardHistoryService(db as unknown as Database);
	});
	afterEach(() => sqlite.close());

	it('migrates all 43 existing people, categories and role history', async () => {
		const members = await service.getAll();
		expect(members).toHaveLength(43);
		expect(members.filter((member) => member.category === 'founder')).toHaveLength(4);
		expect(members.filter((member) => member.category === 'current')).toHaveLength(13);
		for (const member of members) expect(boardMemberSchema.safeParse(member).success).toBe(true);
		expect(members.find((member) => member.name === 'Sturla Rognskog Mella')?.roles).toHaveLength(
			2
		);
		expect(members.find((member) => member.name === 'Fredrik Hast Sørli')?.membership).toEqual({
			start: 'Høst 2025',
			end: 'Vår 2026'
		});
	});

	it('creates, moves and clears a member without changing other people', async () => {
		const before = await service.getAll();
		const id = await service.create({
			name: 'Testperson',
			category: 'current',
			membership: { start: 'Høst 2026' },
			roles: [{ title: 'Leder', period: { start: 'Høst 2026' } }]
		});
		expect((await service.getAll()).find((member) => member.id === id)?.roles[0].title).toBe(
			'Leder'
		);
		expect(await service.update(id, 1, { name: 'Nytt navn', category: 'past', roles: [] })).toBe(
			true
		);
		const after = await service.getAll();
		expect(after.find((member) => member.id === id)).toMatchObject({
			name: 'Nytt navn',
			category: 'past',
			revision: 2,
			roles: [],
			membership: undefined
		});
		expect(after.filter((member) => member.id !== id)).toEqual(before);
	});

	it('rejects stale updates/deletes and deletes only the chosen entry', async () => {
		const id = await service.create({ name: 'Testperson', category: 'current', roles: [] });
		expect(await service.update(id, 1, { name: 'Oppdatert', category: 'current', roles: [] })).toBe(
			true
		);
		expect(await service.update(id, 1, { name: 'Utdatert', category: 'past', roles: [] })).toBe(
			false
		);
		expect(await service.delete(id, 1)).toBe(false);
		expect(await service.delete(id, 2)).toBe(true);
		expect(await service.delete(id, 2)).toBe(false);
		expect(await service.getAll()).toHaveLength(43);
	});
});

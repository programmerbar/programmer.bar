import { and, asc, eq, max, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import type { BoardMember, BoardMemberInput } from '../../board-history';
import type { Database } from '../db/drizzle';
import { boardMembers } from '../db/schemas/board-members';

export class BoardHistoryService {
	#db: Database;

	constructor(db: Database) {
		this.#db = db;
	}

	async getAll(): Promise<BoardMember[]> {
		const rows = await this.#db
			.select()
			.from(boardMembers)
			.orderBy(asc(boardMembers.sortOrder), asc(boardMembers.id));
		return rows.map((row) => ({ ...row, membership: row.membership ?? undefined }));
	}

	async create(input: BoardMemberInput): Promise<string> {
		const [last] = await this.#db.select({ order: max(boardMembers.sortOrder) }).from(boardMembers);
		const id = nanoid();
		await this.#db.insert(boardMembers).values({
			...input,
			id,
			membership: input.membership ?? null,
			sortOrder: (last.order ?? -1) + 1
		});
		return id;
	}

	async update(id: string, revision: number, input: BoardMemberInput): Promise<boolean> {
		const rows = await this.#db
			.update(boardMembers)
			.set({
				...input,
				membership: input.membership ?? null,
				revision: sql`${boardMembers.revision} + 1`
			})
			.where(and(eq(boardMembers.id, id), eq(boardMembers.revision, revision)))
			.returning({ id: boardMembers.id });
		return rows.length > 0;
	}

	async delete(id: string, revision: number): Promise<boolean> {
		const rows = await this.#db
			.delete(boardMembers)
			.where(and(eq(boardMembers.id, id), eq(boardMembers.revision, revision)))
			.returning({ id: boardMembers.id });
		return rows.length > 0;
	}
}

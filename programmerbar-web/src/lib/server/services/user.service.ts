import type { Database } from '$lib/server/db/drizzle';
import { eq, and, not, inArray } from 'drizzle-orm';
import { users, type UserInsert } from '$lib/server/db/schemas';

export class UserService {
	#db: Database;

	constructor(db: Database) {
		this.#db = db;
	}

	async findByFeideId(feideId: string, options?: { includeDeleted: boolean }) {
		const user = await this.#db.query.users.findFirst({
			where: (row, { eq, not, and }) =>
				and(eq(row.feideId, feideId), options?.includeDeleted ? undefined : not(row.isDeleted))
		});

		if (!user) {
			console.log(`[UserService] No user found with Feide ID: ${feideId}`);
		}

		return user;
	}

	async findByFeideIdIncludeDeleted(feideId: string) {
		return await this.#db.query.users.findFirst({
			where: (row, { eq }) => eq(row.feideId, feideId)
		});
	}

	async create(user: UserInsert) {
		const newUser = await this.#db
			.insert(users)
			.values(user)
			.returning()
			.then((rows) => rows[0]);

		console.log(`[UserService] ✅ User created successfully: ${newUser.id} (${newUser.email})`);
		return newUser;
	}

	async findAll() {
		const users = await this.#db.query.users.findMany({
			where: (row, { not }) => not(row.isDeleted)
		});

		return users;
	}

	async updateUserRole(userId: string, role: 'board' | 'normal') {
		const updatedUser = await this.#db
			.update(users)
			.set({ role })
			.where(eq(users.id, userId))
			.returning()
			.then((rows) => rows[0]);

		console.log(`[UserService] ✅ User role updated: ${updatedUser.id} -> ${updatedUser.role}`);
		return updatedUser;
	}

	async updateAltEmail(userId: string, email: string) {
		return await this.#db
			.update(users)
			.set({ altEmail: email })
			.where(eq(users.id, userId))
			.returning()
			.then((rows) => rows[0]);
	}

	async updatePhone(userId: string, phone: string) {
		return await this.#db
			.update(users)
			.set({ phone })
			.where(eq(users.id, userId))
			.returning()
			.then((rows) => rows[0]);
	}

	async updateTrainingStatus(userId: string, isTrained: boolean) {
		const updatedUser = await this.#db
			.update(users)
			.set({ isTrained })
			.where(eq(users.id, userId))
			.returning()
			.then((rows) => rows[0]);

		return updatedUser;
	}

	async updateCanRefer(userId: string, canRefer: boolean) {
		return await this.#db
			.update(users)
			.set({ canRefer })
			.where(eq(users.id, userId))
			.returning()
			.then((rows) => rows[0]);
	}

	async findById(userId: string) {
		const user = await this.#db
			.select()
			.from(users)
			.where(and(eq(users.id, userId), not(users.isDeleted)))
			.then((results) => results[0]);

		return user;
	}

	async findManyById(userIds: Array<string>) {
		return await this.#db
			.select()
			.from(users)
			.where(and(inArray(users.id, userIds), not(users.isDeleted)));
	}

	async deleteUser(userId: string) {
		const deletedUser = await this.#db
			.update(users)
			.set({ isDeleted: true })
			.where(eq(users.id, userId))
			.returning()
			.then((rows) => rows[0]);

		console.log(`[UserService] ✅ User soft deleted: ${deletedUser.id} (${deletedUser.email})`);
		return deletedUser;
	}

	async restoreUser(userId: string) {
		const restoredUser = await this.#db
			.update(users)
			.set({ isDeleted: false })
			.where(eq(users.id, userId))
			.returning()
			.then((rows) => rows[0]);

		console.log(`[UserService] ✅ User restored: ${restoredUser.id} (${restoredUser.email})`);
		return restoredUser;
	}

	async findByIdIncludeDeleted(userId: string) {
		const user = await this.#db
			.select()
			.from(users)
			.where(eq(users.id, userId))
			.then((results) => results[0]);

		return user;
	}

	async findAllIncludeDeleted() {
		return await this.#db.query.users.findMany();
	}

	async findAllBoardMembers() {
		return await this.#db.query.users.findMany({
			where: (row, { eq, not }) => and(eq(row.role, 'board'), not(row.isDeleted))
		});
	}
}

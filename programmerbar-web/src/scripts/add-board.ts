import { and, eq, or, sql } from 'drizzle-orm';
import { users } from '../lib/server/db/schemas';
import { setup } from './setup';

async function main() {
	const { db } = await setup();

	const email = process.argv[2];

	if (!email) {
		throw new Error('Email is required. Example: pnpm add-board "some@email.com"');
	}

	const normalizedEmail = email.trim().toLowerCase();
	const user = await db.query.users.findFirst({
		where: (row, { not }) =>
			and(
				or(
					sql`lower(${row.email}) = ${normalizedEmail}`,
					sql`lower(${row.altEmail}) = ${normalizedEmail}`
				),
				not(row.isDeleted)
			)
	});

	if (!user) {
		throw new Error(`No active user found with email: ${email}`);
	}

	if (user.role === 'board') {
		console.log(`${user.email} already has the board role.`);
		return;
	}

	await db.update(users).set({ role: 'board' }).where(eq(users.id, user.id));
	console.log(`${user.email} has been given the board role.`);
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

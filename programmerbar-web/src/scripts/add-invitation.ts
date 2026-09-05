import { invitations } from '../lib/server/db/schemas';
import { nanoid } from 'nanoid';
import { setup } from './setup';

async function main() {
	const { db } = await setup();

	const email = process.argv[2];

	if (!email) {
		throw new Error('Email is required. Example: pnpm add-invitation "some@email.com"');
	}

	await db.insert(invitations).values({
		createdAt: new Date(),
		email,
		expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
		id: nanoid()
	});

	console.log(`Invitation for ${email} added.`);
}

main()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});

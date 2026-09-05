import { dev } from '$app/environment';
import type { UserInsert } from '$lib/server/db/schemas';
import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const GENERIC_SUCCESS =
	'Hvis e-postadressen tilhører en aktiv bruker, har vi sendt en innloggingslenke.';
type DevLogin = { login: string; user: UserInsert };

// Add more development logins here. The shared action below creates or repairs each account.
const DEV_USERS = [
	{
		login: 'board',
		user: {
			id: 'dev-board-member',
			name: 'Dev Board Member',
			email: 'board@programmer.bar',
			role: 'board'
		}
	}
] satisfies DevLogin[];
const EmailSchema = z.email();

export const load: PageServerLoad = ({ url }) => ({
	magicLinkInvalid: url.searchParams.get('magicLink') === 'invalid',
	devLogins: dev ? DEV_USERS.map(({ login }) => login) : []
});

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const emailValue = formData.get('email');

		await handleDevLogin(event, emailValue);

		const rateLimit = await event.locals.rateLimitService.checkLimit(event, 'magic-link', {
			maxRequests: 5,
			windowSeconds: 15 * 60,
			blockDurationSeconds: 15 * 60
		});

		const emailResult = EmailSchema.safeParse(emailValue);
		if (!emailResult.success) {
			return fail(400, { error: 'Skriv inn en gyldig e-postadresse.' });
		}
		const email = emailResult.data;

		// Return the same response for throttled, unknown, and deleted users to avoid account enumeration.
		if (!rateLimit.allowed) return { success: true, message: GENERIC_SUCCESS };

		const user = await event.locals.userService.findActiveByEmail(email);
		if (user) {
			try {
				const recipientEmail = email.trim().toLowerCase();
				const token = await event.locals.magicLinkService.create(user.id);
				const magicLink = new URL('/auth/magic-link/verify', event.url.origin);
				magicLink.searchParams.set('token', token);
				await event.locals.emailService.sendMagicLinkEmail({
					email: recipientEmail,
					url: magicLink.toString()
				});
			} catch (error) {
				// Do not expose delivery failures, since that would reveal whether the account exists.
				console.error('[MagicLink] Failed to create or send login link', error);
			}
		}

		return { success: true, message: GENERIC_SUCCESS };
	}
};

async function handleDevLogin(event: RequestEvent, loginValue: FormDataEntryValue | null) {
	if (!dev || typeof loginValue !== 'string') return;

	const normalizedLogin = loginValue.trim().toLowerCase();
	const devLogin = DEV_USERS.find(({ login }) => login === normalizedLogin);
	if (!devLogin) return;

	const userDetails = devLogin.user;
	let user = await event.locals.userService.findByIdIncludeDeleted(userDetails.id);

	if (!user) {
		user = await event.locals.userService.create(userDetails);
	} else {
		if (user.isDeleted) {
			user = await event.locals.userService.restoreUser(user.id);
		}
		if (userDetails.role && user.role !== userDetails.role) {
			user = await event.locals.userService.updateUserRole(user.id, userDetails.role);
		}
	}

	const session = await event.locals.auth.createSession(user.id, {});
	const sessionCookie = event.locals.auth.createSessionCookie(session.id);
	event.cookies.set(sessionCookie.name, sessionCookie.value, {
		...sessionCookie.attributes,
		path: '/'
	});

	redirect(303, '/portal');
}

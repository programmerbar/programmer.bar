import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';

const GENERIC_SUCCESS =
	'Hvis e-postadressen tilhører en aktiv bruker, har vi sendt en innloggingslenke.';
const EmailSchema = z.email();

export const load: PageServerLoad = ({ url }) => ({
	magicLinkInvalid: url.searchParams.get('magicLink') === 'invalid'
});

export const actions: Actions = {
	default: async (event) => {
		const rateLimit = await event.locals.rateLimitService.checkLimit(event, 'magic-link', {
			maxRequests: 5,
			windowSeconds: 15 * 60,
			blockDurationSeconds: 15 * 60
		});

		const formData = await event.request.formData();
		const emailValue = formData.get('email');
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

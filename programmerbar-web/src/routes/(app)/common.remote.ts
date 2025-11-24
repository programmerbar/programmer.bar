import { form, getRequestEvent, query } from '$app/server';
import { fail } from '@sveltejs/kit';
import z from 'zod';

export const getStatus = query(async () => {
	const { locals } = getRequestEvent();
	return await locals.statusService.getWithMessage();
});

/**
 * Check if message content contains spam patterns
 */
function isSpamMessage(message: string): boolean {
	const lowerMessage = message.toLowerCase();

	const spamPatterns = [
		'bange',
		'bangeshop.com',
		'usb charging port',
		'50% off',
		'free shipping',
		'backpacks.*sling bags',
		'anti-theft design',
		'waterproof.*anti-theft',
		'built-in usb',
		'order yours now'
	];

	let spamScore = 0;
	for (const pattern of spamPatterns) {
		if (new RegExp(pattern, 'i').test(lowerMessage)) {
			spamScore++;
		}
	}

	// If 2 or more spam patterns match, consider it spam
	return spamScore >= 2;
}

const ContanctSubmissionSchema = z.object({
	// Honeypot fields
	name: z.string().optional(),
	email: z.string().optional(),

	// Actual fields
	namekjkj: z.string().min(1, 'Name is required'),
	emailkjkj: z.email('Invalid email address'),
	messagekjkj: z.string().min(1, 'Message is required')
});

export const createContactSubmissionAction = form(
	ContanctSubmissionSchema,
	async ({ name, email, namekjkj, emailkjkj, messagekjkj }) => {
		const event = getRequestEvent();
		const { locals, getClientAddress } = event;
		const ip = getClientAddress();

		// Check honeypot fields
		if (name || email) {
			await locals.banService.ban(event);
			return fail(400, { success: false });
		}

		// Check for spam in message content
		if (isSpamMessage(messagekjkj)) {
			console.log(`[ContactForm] 🚫 Spam detected from IP: ${ip}`);
			await locals.banService.ban(event);
			return fail(400, { success: false });
		}

		const data = {
			name: namekjkj,
			email: emailkjkj,
			message: messagekjkj
		};

		await locals.contactSubmissionService.create({
			...data,
			ipAddress: ip
		});

		try {
			await locals.emailService.sendContactUsEmail(data);

			return { success: true };
		} catch (error) {
			console.error('Failed to send email:', error);
			return fail(500, { success: false, error: 'Failed to send email' });
		}
	}
);

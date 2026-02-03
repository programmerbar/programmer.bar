import { form, getRequestEvent, query } from '$app/server';
import { validateTurnstile } from '$lib/server/turnstile';
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
	messagekjkj: z.string().min(1, 'Message is required'),
	cfTurnstileResponse: z.string().min(1, 'CAPTCHA verification is required')
});

export const createContactSubmissionAction = form(
	ContanctSubmissionSchema,
	async ({
		name: honeypotName,
		email: honeypotEmail,
		namekjkj: name,
		emailkjkj: email,
		messagekjkj: message,
		cfTurnstileResponse: token
	}) => {
		const event = getRequestEvent();
		const { locals, getClientAddress } = event;
		const ip = getClientAddress();

		// Check honeypot fields
		if (honeypotName || honeypotEmail) {
			console.log(`[ContactForm] 🚫 Honeypot triggered from IP: ${ip}`);
			await locals.banService.ban(event);
			return fail(400, { success: false });
		}

		const rateLimitResult = await locals.rateLimitService.checkLimit(event, 'contact-form', {
			maxRequests: 3,
			windowSeconds: 60 * 60, // 1 hour
			blockDurationSeconds: 60 * 60 // 1 hour
		});

		if (!rateLimitResult.allowed) {
			console.log(
				`[ContactForm] Rate limit exceeded from IP: ${ip}. Retry after ${rateLimitResult.retryAfter}s`
			);
			return fail(429, {
				success: false,
				error: 'Too many requests. Please try again later.',
				retryAfter: rateLimitResult.retryAfter
			});
		}

		const validation = await validateTurnstile(token, ip);
		if (!validation.success) {
			console.log(`[ContactForm] Turnstile validation failed from IP: ${ip}`);
			return fail(400, { success: false, error: 'CAPTCHA verification failed' });
		}

		// Check for spam in message content
		if (isSpamMessage(message)) {
			console.log(`[ContactForm] Spam detected from IP: ${ip}`);
			await locals.banService.ban(event);
			return fail(400, { success: false });
		}

		const data = {
			name,
			email,
			message
		};

		await locals.contactSubmissionService.create({
			...data,
			ipAddress: ip
		});

		try {
			await locals.emailService.sendContactUsSlackMessage(data);

			return { success: true };
		} catch (error) {
			console.error('Failed to send email:', error);
			return fail(500, { success: false, error: 'Failed to send email' });
		}
	}
);

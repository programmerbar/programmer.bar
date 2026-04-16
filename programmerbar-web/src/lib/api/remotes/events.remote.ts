import { CreateEventSchema } from '$lib/validators';
import type { ShiftEmailProps } from '$lib/server/services/email.service';
import { normalDate } from '$lib/utils/date';
import { z } from 'zod';
import { command, getRequestEvent } from '$app/server';

export const createEvent = command(CreateEventSchema, async (event) => {
	const { locals, platform } = getRequestEvent();

	if (!locals.user) {
		return {
			success: false,
			message: 'Unauthorized'
		};
	}

	const { name, date, slug, description, shifts } = event;

	const createdEvent = await locals.eventService.create(name, date, slug, description);
	if (!createdEvent) {
		return {
			success: false,
			message: 'Failed to create event'
		};
	}

	const mappedShifts = shifts.map((shift) => ({
		eventId: createdEvent.id,
		startAt: new Date(shift.startAt),
		endAt: new Date(shift.endAt)
	}));
	const createdShifts = await locals.eventService.createShifts(mappedShifts);
	if (!createdShifts) {
		return {
			success: false,
			message: 'Failed to create shifts'
		};
	}

	const mappedUserShifts = createdShifts.flatMap((shift, i) => {
		return shifts[i].users.map((user) => ({
			shiftId: shift.id,
			userId: user
		}));
	});
	await locals.eventService.createUserShifts(mappedUserShifts);

	const userIds = Array.from(new Set(mappedUserShifts.flatMap((shift) => shift.userId)));
	platform?.ctx.waitUntil(
		sendShiftEmails(locals, userIds, createdEvent.name, createdShifts, shifts)
	);

	if (userIds.length > 0) {
		await locals.notificationService.sendNotifications(userIds, {
			title: 'Ny vakt tildelt',
			message: `Du har blitt tildelt en vakt for ${createdEvent.name}.`
		});
	}

	return {
		success: true,
		eventId: createdEvent.id
	};
});

async function sendShiftEmails(
	locals: App.Locals,
	userIds: Array<string>,
	eventName: string,
	createdShifts: Awaited<ReturnType<App.Locals['eventService']['createShifts']>>,
	shifts: z.infer<typeof CreateEventSchema>['shifts']
) {
	const users = await locals.userService.findManyById(userIds);

	const emailsToSend: Array<ShiftEmailProps> = [];

	for (const shift of createdShifts) {
		const shiftData = shifts.find((s) => {
			return (
				new Date(s.startAt).toISOString() === new Date(shift.startAt).toISOString() &&
				new Date(s.endAt).toISOString() === new Date(shift.endAt).toISOString()
			);
		});

		if (!shiftData) {
			console.warn(`No matching shift data found for shift ID ${shift.id}`);
			continue;
		}

		for (const userId of shiftData.users) {
			const user = users.find((u) => u.id === userId);

			if (!user || !user.email || !user.altEmail) continue;

			emailsToSend.push({
				user: {
					name: user.name || 'Frivillig',
					email: user.altEmail || user.email
				},
				shift: {
					id: shift.id,
					startAt: new Date(shift.startAt).toISOString(),
					endAt: new Date(shift.endAt).toISOString(),
					startAtFormatted: normalDate(shift.startAt),
					endAtFormatted: normalDate(shift.endAt),
					summary: `Vakt: ${eventName}`,
					description: `Du har fått en vakt på "${eventName}".`
				}
			});
		}
	}

	const emailPromises = [];

	for (const data of emailsToSend) {
		emailPromises.push(
			locals.emailService
				.sendShiftEmail(data)
				.then(() =>
					console.log(`Sent shift email to ${data.user.email} for shift ${data.shift.id}`)
				)
				.catch((err: Error) => console.error(`Failed to send email to ${data.user.email}:`, err))
		);
	}

	// Execute all emails in parallel
	if (emailPromises.length > 0) {
		await Promise.allSettled(emailPromises);
		console.log(`Processed ${emailPromises.length} email notifications`);
	}
}

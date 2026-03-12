import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import type { EventService } from '$lib/server/services/event.service';

export const load: PageServerLoad = async ({ locals, params }) => {
	const event = await locals.eventService.findFullEventById(params.id);

	if (!event) {
		throw error(404, 'Event not found');
	}

	return {
		event
	};
};

// Nice code to get the type of a non-null event from `locals.eventService.findFullEventById`
type FullEvent = Exclude<
	Awaited<ReturnType<(typeof EventService)['prototype']['findFullEventById']>>,
	undefined
>;

const getMembersFromShift = (event: FullEvent) => {
	const members = new Map<string, { name: string; email: string }>();
	for (const shift of event.shifts) {
		for (const member of shift.members) {
			if (!members.has(member.user.id)) {
				members.set(member.user.id, {
					name: member.user.name,
					email: member.user.email
				});
			}
		}
	}
	return members;
};

export const actions: Actions = {
	delete: async ({ params, locals, platform }) => {
		if (locals.user?.role === 'board') {
			const event = await locals.eventService.findFullEventById(params.id);

			if (event) {
				const usersToNotify = getMembersFromShift(event);
				const eventDate = event.date.toLocaleDateString('nb-NO', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				});

				// Don't block on sending the emails
				platform?.ctx.waitUntil(
					Promise.all(
						Array.from(usersToNotify.values()).map((user) =>
							locals.emailService.sendShiftCancelledEmail({
								event: { name: event.name, date: eventDate },
								user
							})
						)
					)
				);
			}

			await locals.eventService.delete(params.id);
			throw redirect(303, '/portal/arrangementer');
		}

		return fail(401, {
			message: 'Unauthorized'
		});
	},
	join: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, {
				message: 'Not logged in'
			});
		}

		const formData = await request.formData();
		const shiftId = formData.get('shiftId');
		if (!shiftId || typeof shiftId !== 'string') {
			return fail(400, {
				message: 'Missing shiftId'
			});
		}

		await locals.eventService.createUserShift({
			shiftId,
			userId: locals.user.id,
			status: 'accepted'
		});

		// Notify board members
		const event = await locals.eventService.findFullEventById(params.id);
		const boardMemebers = (await locals.userService.findAllBoardMembers()).map((user) => user.id);

		await locals.notificationService.sendNotifications(boardMemebers, {
			title: 'Ny frivillig på vakt',
			message: `${locals.user.name} har meldt seg på en vakt for ${event?.name ?? params.id}.`
		});

		return { success: true };
	},
	leave: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, {
				message: 'Not logged in'
			});
		}

		const formData = await request.formData();
		const shiftId = formData.get('shiftId');
		if (!shiftId || typeof shiftId !== 'string') {
			return fail(400, {
				message: 'Missing shiftId'
			});
		}

		await locals.eventService.deleteUserShift({
			shiftId,
			userId: locals.user.id
		});

		// Notify board members
		const event = await locals.eventService.findFullEventById(params.id);
		const boardMemebers = (await locals.userService.findAllBoardMembers()).map((user) => user.id);

		await locals.notificationService.sendNotifications(boardMemebers, {
			title: 'Frivillig har forlatt vakt',
			message: `${locals.user.name} har forlatt vakten for ${event?.name ?? params.id}.`
		});

		return { success: true };
	}
};

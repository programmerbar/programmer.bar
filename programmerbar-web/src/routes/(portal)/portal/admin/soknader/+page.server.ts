import type { PageServerLoad, Actions } from './$types';
import { nanoid } from 'nanoid';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'board') {
		throw redirect(303, '/portal');
	}

	const pendingApplications = await locals.pendingApplicationService.findAll();

	return {
		pendingApplications
	};
};

export const actions: Actions = {
	approve: async ({ locals, request }) => {
		if (!locals.user || locals.user.role !== 'board') {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const applicationId = data.get('applicationId') as string;
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const feideId = data.get('feideId') as string;

		const existingUser = await locals.userService.findByFeideId(feideId, { includeDeleted: true });
		if (existingUser) {
			await locals.userService.restoreUser(existingUser.id);
		} else {
			const userId = nanoid();
			await locals.userService.create({
				id: userId,
				name,
				email,
				feideId
			});
		}

		await locals.pendingApplicationService.delete(applicationId);

		return { success: true, message: 'Søknad godkjent og bruker opprettet' };
	},

	deny: async ({ locals, request }) => {
		if (!locals.user || locals.user.role !== 'board') {
			return fail(401, { error: 'Unauthorized' });
		}

		const data = await request.formData();
		const applicationId = data.get('applicationId') as string;
		const email = data.get('email') as string;
		const feideId = data.get('feideId') as string;

		await locals.pendingApplicationService.delete(applicationId);

		const existingUser = await locals.userService.findByFeideId(feideId);
		if (existingUser) {
			await locals.userService.deleteUser(existingUser.id);
		}

		const existingInvitation = await locals.invitationService.findByEmail(email);
		if (existingInvitation) {
			await locals.invitationService.delete(existingInvitation.id);
		}

		return { success: true, message: 'Søknad avslått og fjernet' };
	}
};

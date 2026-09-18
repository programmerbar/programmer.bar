import { UserRoleSchema } from '$lib/validators';
import { isTrainingComplete } from '$lib/utils/training';
import { redirect, fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'board') {
		throw redirect(303, '/portal');
	}

	const users = await locals.userService.findAll();

	return {
		user: locals.user,
		users
	};
};

export const actions: Actions = {
	completeTraining: async ({ request, locals }) => {
		if (!locals.user || locals.user.role !== 'board') {
			return fail(401, { error: 'Du har ikke tilgang til å registrere opplæring.' });
		}
		const formData = await request.formData();
		const ids = formData.getAll('userId');
		if (!ids.length || ids.some((id) => typeof id !== 'string' || !id.trim())) {
			return fail(400, { error: 'Velg minst én bruker.' });
		}
		const userIds = [...new Set(ids as string[])];
		let trainingData: unknown;
		try {
			trainingData = JSON.parse(String(formData.get('trainingData')));
		} catch {
			return fail(400, { error: 'Ugyldig opplæringsdata.' });
		}
		if (!isTrainingComplete(trainingData)) {
			return fail(400, { error: 'Alle opplæringspunktene må være fullført.' });
		}
		const users = await locals.userService.findAll();
		if (userIds.some((id) => !users.some((user) => user.id === id))) {
			return fail(400, {
				error: 'En valgt bruker finnes ikke lenger. Oppdater siden og prøv igjen.'
			});
		}
		await locals.userService.completeTrainingForUsers(userIds);
		return { success: true, trainingCompleted: true };
	},
	updateRole: async ({ request, locals }) => {
		const formData = await request.formData();
		const userId = formData.get('userId') as string;
		const role = UserRoleSchema.safeParse(formData.get('role'));

		if (!role.success) {
			return fail(400, { error: 'Invalid role specified' });
		}

		if (!locals.user || locals.user.role !== 'board') {
			return fail(401, { error: 'Unauthorized' });
		}

		const success = await locals.userService.updateUserRole(userId, role.data);

		if (success) {
			return { success: true };
		} else {
			return fail(500, { error: 'Failed to update user role' });
		}
	}
};

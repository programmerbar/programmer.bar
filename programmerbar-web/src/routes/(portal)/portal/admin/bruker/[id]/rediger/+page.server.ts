import { UserRoleSchema } from '$lib/validators';
import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = params.id;

	if (!locals.user || locals.user.role !== 'board') {
		throw error(401, 'Unauthorized');
	}

	if (!userId) {
		throw error(404, 'User ID not provided');
	}

	const user = await locals.userService.findById(userId);
	if (!user) {
		throw error(404, 'User not found');
	}

	return {
		user
	};
};

export const actions: Actions = {
	save: async ({ params, request, locals }) => {
		if (!locals.user || locals.user.role !== 'board') {
			throw error(401, 'Unauthorized');
		}

		const userId = params.id;
		const formData = await request.formData();
		const role = UserRoleSchema.safeParse(formData.get('role'));
		if (!role.success) return fail(400, { message: 'Ugyldig rolle' });
		const phone = formData.get('phone')?.toString();
		const canRefer = formData.get('canRefer') === 'true';

		if (phone) {
			await locals.userService.updatePhone(userId, phone);
		}
		await locals.userService.updateUserRole(userId, role.data);
		await locals.userService.updateCanRefer(userId, canRefer);

		throw redirect(303, `/portal/admin/bruker/${userId}`);
	}
};

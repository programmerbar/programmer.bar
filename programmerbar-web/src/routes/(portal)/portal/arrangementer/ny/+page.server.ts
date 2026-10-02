import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.role !== 'board') {
		throw redirect(303, '/portal');
	}
	const users = await locals.userService.findAllActiveVolunteers().then((users) =>
		users.map((user) => ({
			label: user.name,
			value: user.id
		}))
	);

	const allSlugs = await locals.eventService.allSlugs();

	return {
		users,
		allSlugs
	};
};

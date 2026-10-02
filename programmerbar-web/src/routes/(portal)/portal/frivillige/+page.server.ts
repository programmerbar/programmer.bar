import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [users, invitations] = await Promise.all([
		locals.userService.findAllActiveVolunteers(),
		locals.invitationService.findAllUnused()
	]);

	const isBoardMember = locals.user?.role === 'board';

	return {
		users,
		invitations: isBoardMember ? invitations : []
	};
};

export const actions: Actions = {
	deleteInvitation: async ({ request, locals }) => {
		const user = locals.user;

		if (!user || user.role !== 'board') {
			return fail(403, {
				success: false,
				message: 'Du har ikke tilgang til å slette invitasjoner'
			});
		}

		const formData = await request.formData();
		const invitationId = formData.get('invitationId') as string;
		if (!invitationId) {
			return fail(400, {
				success: false,
				message: 'Mangler invitasjons-ID'
			});
		}

		try {
			await locals.invitationService.delete(invitationId);

			return {
				success: true,
				message: 'Invitasjon slettet'
			};
		} catch (e) {
			console.error(e);

			return fail(404, {
				success: false,
				message: 'Noe gikk feil...'
			});
		}
	}
};

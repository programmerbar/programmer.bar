import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import { boardMemberSchema } from '../../../lib/board-history';
import type { Actions, PageServerLoad } from './$types';

const identitySchema = z.object({
	id: z.string().min(1).max(100),
	revision: z.coerce.number().int().positive()
});
const conflict =
	'Oppføringen er endret eller slettet av noen andre. Last siden på nytt før du prøver igjen.';

export const load: PageServerLoad = async ({ locals }) => ({
	boardMembers: await locals.boardHistoryService.getAll(),
	canEdit: locals.user?.role === 'board'
});

export const actions: Actions = {
	save: async ({ locals, request }) => {
		if (locals.user?.role !== 'board') error(403, 'Bare styret kan redigere styrehistorikken.');
		const form = await request.formData();
		const raw = form.get('member');
		if (typeof raw !== 'string' || raw.length > 30000)
			return fail(400, { message: 'Ugyldig skjema.' });
		let input: unknown;
		try {
			input = JSON.parse(raw);
		} catch {
			return fail(400, { message: 'Ugyldig skjema.' });
		}
		const parsed = boardMemberSchema.safeParse(input);
		if (!parsed.success) return fail(400, { message: parsed.error.issues[0].message });
		const id = form.get('id');
		if (id) {
			const identity = identitySchema.safeParse({ id, revision: form.get('revision') });
			if (!identity.success) return fail(400, { message: 'Ugyldig oppføring.' });
			if (
				!(await locals.boardHistoryService.update(
					identity.data.id,
					identity.data.revision,
					parsed.data
				))
			)
				return fail(409, { message: conflict });
		} else {
			await locals.boardHistoryService.create(parsed.data);
		}
		return { success: true };
	},
	delete: async ({ locals, request }) => {
		if (locals.user?.role !== 'board') error(403, 'Bare styret kan redigere styrehistorikken.');
		const form = await request.formData();
		const identity = identitySchema.safeParse({
			id: form.get('id'),
			revision: form.get('revision')
		});
		if (!identity.success) return fail(400, { message: 'Ugyldig oppføring.' });
		if (!(await locals.boardHistoryService.delete(identity.data.id, identity.data.revision)))
			return fail(409, { message: conflict });
		return { success: true };
	}
};

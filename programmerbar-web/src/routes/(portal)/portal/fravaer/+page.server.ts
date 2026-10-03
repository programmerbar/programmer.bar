import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import { availabilitySchema } from '$lib/validators/availability';
import type { Actions, PageServerLoad } from './$types';
import {
	recurringAvailabilitySchema,
	recurringPeriods,
	dateRangeSchema,
	wholeDayPeriod,
	todayInOslo
} from '$lib/availability-periods';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) error(401, 'Du må logge inn.');
	return {
		absences: await locals.shiftService.findAbsences(locals.user.id),
		today: todayInOslo(new Date())
	};
};

export const actions: Actions = {
	recurring: async ({ request, locals }) => {
		if (!locals.user) error(401, 'Du må logge inn.');
		const data = await request.formData();
		const parsed = recurringAvailabilitySchema.safeParse({
			startDate: data.get('startDate'),
			endDate: data.get('endDate'),
			weekdays: data.getAll('weekdays')
		});
		if (!parsed.success)
			return fail(400, {
				message: parsed.error.issues[0]?.message ?? 'Velg datoer og minst én ukedag.'
			});
		const now = new Date();
		if (parsed.data.startDate < todayInOslo(now))
			return fail(400, { message: 'Startdato kan ikke være før i dag.' });
		const periods = recurringPeriods(parsed.data, now);
		if (!periods.length)
			return fail(400, { message: 'Ingen av de valgte ukedagene finnes i perioden.' });
		const conflict = await locals.shiftService.addAbsences(locals.user.id, periods);
		return {
			message: `${periods.length} perioder er lagret.${conflict ? ' Du har allerede vakt i en av periodene. Kontakt frivilligansvarlig for å bytte. Vaktene er ikke fjernet.' : ''}`
		};
	},
	add: async ({ request, locals }) => {
		if (!locals.user) error(401, 'Du må logge inn.');
		const data = await request.formData();
		const range = dateRangeSchema.safeParse({
			startDate: data.get('startDate'),
			endDate: data.get('endDate') || data.get('startDate')
		});
		if (!range.success)
			return fail(400, {
				message: 'Velg gyldige datoer. Til-dato må være lik eller etter fra-dato.'
			});
		const allDay = z.enum(['true', 'false']).safeParse(data.get('allDay'));
		if (!allDay.success) return fail(400, { message: 'Velg hele dager eller klokkeslett.' });
		const parsed =
			allDay.data === 'true'
				? { success: true as const, data: wholeDayPeriod(range.data.startDate, range.data.endDate) }
				: availabilitySchema.safeParse({
						startAt: `${range.data.startDate}T${data.get('startTime')}`,
						endAt: `${range.data.endDate}T${data.get('endTime')}`
					});
		if (!parsed.success)
			return fail(400, { message: 'Velg gyldige klokkeslett. Slutt må være etter start.' });
		if (parsed.data.endAt <= new Date())
			return fail(400, { message: 'Perioden må slutte i fremtiden.' });
		const conflict = await locals.shiftService.addAbsence(locals.user.id, parsed.data);
		return {
			message: conflict
				? 'Perioden er lagret. Du er allerede satt opp på en vakt i perioden. Kontakt frivilligansvarlig for å få byttet vakten. Vakten er ikke fjernet.'
				: 'Perioden er lagret.'
		};
	},
	delete: async ({ request, locals }) => {
		if (!locals.user) error(401, 'Du må logge inn.');
		const parsed = z
			.string()
			.min(1)
			.safeParse((await request.formData()).get('id'));
		if (!parsed.success) return fail(400, { message: 'Velg perioden du vil slette.' });
		const deleted = await locals.shiftService.deleteAbsence(locals.user.id, parsed.data);
		if (!deleted.length) return fail(404, { message: 'Fant ikke perioden.' });
		return { message: 'Perioden er slettet.' };
	}
};

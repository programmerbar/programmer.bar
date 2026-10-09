import { z } from 'zod';
import { parseDateTimeLocal, toLocalDateTimeString } from '../utils/date';

const localDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
	.transform((value, ctx) => {
		const date = parseDateTimeLocal(value);
		if (!Number.isFinite(date.getTime()) || toLocalDateTimeString(date) !== value) {
			ctx.addIssue({ code: 'custom', message: 'Ugyldig dato eller klokkeslett.' });
			return z.NEVER;
		}
		return date;
	});

export const availabilitySchema = z
	.object({ startAt: localDate, endAt: localDate })
	.refine((value) => value.endAt > value.startAt, 'Slutt må være etter start.');

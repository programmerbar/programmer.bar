import { z } from 'zod';
import { parseDateTimeLocal, toLocalDateTimeString } from './utils/date';
import type { Interval } from './shift-planning';
import { availabilitySchema } from './validators/availability';

const calendarDate = z
	.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/)
	.refine((value) => {
		const date = new Date(`${value}T00:00:00Z`);
		return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
	}, 'Velg en gyldig dato.');

export const dateRangeSchema = z
	.object({
		startDate: calendarDate,
		endDate: calendarDate
	})
	.refine(
		(value) => value.endDate >= value.startDate,
		'Til-dato må være lik eller etter fra-dato.'
	);

export const recurringAvailabilitySchema = dateRangeSchema
	.safeExtend({
		weekdays: z.array(z.coerce.number().int().min(0).max(6)).min(1, 'Velg minst én ukedag.').max(7),
		allDay: z.boolean().optional(),
		startTime: z.string().optional(),
		endTime: z.string().optional()
	})
	.refine(
		(value) =>
			new Date(value.endDate).getTime() - new Date(value.startDate).getTime() < 366 * 86400000,
		'Velg maksimalt ett år om gangen.'
	)
	.superRefine((input, ctx) => {
		if (input.allDay !== false) return;
		const clock = /^([01]\d|2[0-3]):[0-5]\d$/;
		if (
			!clock.test(input.startTime ?? '') ||
			!clock.test(input.endTime ?? '') ||
			input.startTime === input.endTime
		) {
			ctx.addIssue({
				code: 'custom',
				message: 'Velg ulike og gyldige klokkeslett for start og slutt.'
			});
			return;
		}
		if (
			!dateRangeSchema.safeParse(input).success ||
			new Date(input.endDate).getTime() - new Date(input.startDate).getTime() >= 366 * 86400000
		)
			return;
		for (
			let day = new Date(`${input.startDate}T00:00:00Z`);
			day <= new Date(`${input.endDate}T00:00:00Z`);
			day = nextDay(day)
		) {
			if (
				input.weekdays.includes(day.getUTCDay()) &&
				!availabilitySchema.safeParse(timedPeriodStrings(day, input.startTime!, input.endTime!))
					.success
			) {
				ctx.addIssue({
					code: 'custom',
					message:
						'Klokkeslettet finnes ikke på en av datoene på grunn av overgangen til sommertid. Velg et annet klokkeslett eller del opp perioden.'
				});
				return;
			}
		}
	});

// UTC dates are calendar cursors only. Each boundary is converted separately to Oslo time,
// so a whole day remains midnight-to-midnight across daylight saving changes.
const localMidnight = (date: Date) =>
	parseDateTimeLocal(`${date.toISOString().slice(0, 10)}T00:00`);
const nextDay = (date: Date) => new Date(date.getTime() + 24 * 60 * 60 * 1000);

function timedPeriodStrings(day: Date, startTime: string, endTime: string) {
	const endDay = endTime < startTime ? nextDay(day) : day;
	return {
		startAt: `${day.toISOString().slice(0, 10)}T${startTime}`,
		endAt: `${endDay.toISOString().slice(0, 10)}T${endTime}`
	};
}

export function recurringPeriods(
	input: z.infer<typeof recurringAvailabilitySchema>,
	now: Date
): Interval[] {
	let cursor = new Date(`${input.startDate}T00:00:00Z`);
	const end = new Date(`${input.endDate}T00:00:00Z`);
	const periods: Interval[] = [];
	while (cursor <= end) {
		const tomorrow = nextDay(cursor);
		const times =
			input.allDay === false ? timedPeriodStrings(cursor, input.startTime!, input.endTime!) : null;
		const period = times
			? { startAt: parseDateTimeLocal(times.startAt), endAt: parseDateTimeLocal(times.endAt) }
			: { startAt: localMidnight(cursor), endAt: localMidnight(tomorrow) };
		if (input.weekdays.includes(cursor.getUTCDay()) && period.endAt > now) periods.push(period);
		cursor = tomorrow;
	}
	return periods;
}

export function wholeDayPeriod(startDate: string, endDate: string): Interval {
	return {
		startAt: localMidnight(new Date(`${startDate}T00:00:00Z`)),
		endAt: localMidnight(nextDay(new Date(`${endDate}T00:00:00Z`)))
	};
}

export const todayInOslo = (now: Date) => toLocalDateTimeString(now).slice(0, 10);

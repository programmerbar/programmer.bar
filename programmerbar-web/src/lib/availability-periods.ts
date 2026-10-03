import { z } from 'zod';
import { parseDateTimeLocal, toLocalDateTimeString } from './utils/date';
import type { Interval } from './shift-planning';

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
		weekdays: z.array(z.coerce.number().int().min(0).max(6)).min(1, 'Velg minst én ukedag.').max(7)
	})
	.refine(
		(value) =>
			new Date(value.endDate).getTime() - new Date(value.startDate).getTime() < 366 * 86400000,
		'Velg maksimalt ett år om gangen.'
	);

// UTC dates are calendar cursors only. Each boundary is converted separately to Oslo time,
// so a whole day remains midnight-to-midnight across daylight saving changes.
const localMidnight = (date: Date) =>
	parseDateTimeLocal(`${date.toISOString().slice(0, 10)}T00:00`);
const nextDay = (date: Date) => new Date(date.getTime() + 24 * 60 * 60 * 1000);

export function recurringPeriods(
	input: z.infer<typeof recurringAvailabilitySchema>,
	now: Date
): Interval[] {
	let cursor = new Date(`${input.startDate}T00:00:00Z`);
	const end = new Date(`${input.endDate}T00:00:00Z`);
	const periods: Interval[] = [];
	while (cursor <= end) {
		const tomorrow = nextDay(cursor);
		const period = { startAt: localMidnight(cursor), endAt: localMidnight(tomorrow) };
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

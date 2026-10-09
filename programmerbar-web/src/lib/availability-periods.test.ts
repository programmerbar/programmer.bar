import { describe, expect, it } from 'vitest';
import {
	recurringAvailabilitySchema,
	recurringPeriods,
	dateRangeSchema,
	wholeDayPeriod
} from './availability-periods';
import { toLocalDateTimeString } from './utils/date';
import { overlaps } from './shift-planning';

describe('repeating availability', () => {
	it('repeats only the selected hours and permits a later shift', () => {
		const input = recurringAvailabilitySchema.parse({
			startDate: '2026-10-09',
			endDate: '2026-10-30',
			weekdays: [5],
			allDay: false,
			startTime: '16:00',
			endTime: '18:00'
		});
		const periods = recurringPeriods(input, new Date('2026-10-01'));
		expect(periods).toHaveLength(4);
		for (const period of periods) {
			expect(toLocalDateTimeString(period.startAt).slice(11)).toBe('16:00');
			expect(toLocalDateTimeString(period.endAt).slice(11)).toBe('18:00');
		}
		expect(periods[0].startAt.toISOString()).toBe('2026-10-09T14:00:00.000Z');
		expect(periods[3].startAt.toISOString()).toBe('2026-10-30T15:00:00.000Z');
		expect(
			overlaps(periods[0], {
				startAt: new Date('2026-10-09T18:00Z'),
				endAt: new Date('2026-10-09T22:00Z')
			})
		).toBe(false);
		expect(
			overlaps(periods[0], {
				startAt: new Date('2026-10-09T15:00Z'),
				endAt: new Date('2026-10-09T19:00Z')
			})
		).toBe(true);
	});
	it('allows midnight or next-day endings on the last selected date', () => {
		for (const endTime of ['00:00', '02:00']) {
			const input = recurringAvailabilitySchema.parse({
				startDate: '2026-10-09',
				endDate: '2026-10-09',
				weekdays: [5],
				allDay: false,
				startTime: '20:00',
				endTime
			});
			const [period] = recurringPeriods(input, new Date('2026-10-01'));
			expect(toLocalDateTimeString(period.endAt)).toBe(`2026-10-10T${endTime}`);
		}
	});
	it('rejects missing, invalid, equal and nonexistent local times', () => {
		const input = {
			startDate: '2026-03-29',
			endDate: '2026-03-29',
			weekdays: [0],
			allDay: false,
			startTime: '16:00',
			endTime: '18:00'
		};
		for (const change of [
			{ startTime: '' },
			{ endTime: undefined },
			{ endTime: '24:00' },
			{ endTime: '16:00' },
			{ startTime: '02:30', endTime: '04:00' }
		]) {
			expect(recurringAvailabilitySchema.safeParse({ ...input, ...change }).success).toBe(false);
		}
	});
	it('omits a timed occurrence that has already ended today', () => {
		const input = recurringAvailabilitySchema.parse({
			startDate: '2026-10-09',
			endDate: '2026-10-16',
			weekdays: [5],
			allDay: false,
			startTime: '16:00',
			endTime: '18:00'
		});
		const periods = recurringPeriods(input, new Date('2026-10-09T17:00Z'));
		expect(periods).toHaveLength(1);
		expect(toLocalDateTimeString(periods[0].startAt)).toBe('2026-10-16T16:00');
	});
	it('includes both date boundaries and permits a single selected day', () => {
		const input = { startDate: '2026-09-01', endDate: '2026-09-01', weekdays: [2] };
		expect(recurringAvailabilitySchema.safeParse(input).success).toBe(true);
		const periods = recurringPeriods(input, new Date('2026-01-01'));
		expect(periods).toHaveLength(1);
		expect(toLocalDateTimeString(periods[0].endAt)).toBe('2026-09-02T00:00');
		expect(recurringPeriods({ ...input, weekdays: [3] }, new Date('2026-01-01'))).toEqual([]);
	});
	it('creates every Tuesday and Wednesday for one calendar month', () => {
		const periods = recurringPeriods(
			{ startDate: '2026-09-01', endDate: '2026-09-30', weekdays: [2, 3] },
			new Date('2026-09-01T00:00Z')
		);
		expect(periods).toHaveLength(10);
		expect(toLocalDateTimeString(periods[0].startAt)).toBe('2026-09-01T00:00');
		expect(toLocalDateTimeString(periods.at(-1)!.startAt)).toBe('2026-09-30T00:00');
	});
	it('supports custom date ranges and ignores duplicate weekdays', () => {
		const periods = recurringPeriods(
			{ startDate: '2026-01-31', endDate: '2026-03-30', weekdays: [2, 2] },
			new Date('2026-01-01')
		);
		expect(periods).toHaveLength(8);
		expect(toLocalDateTimeString(periods.at(-1)!.startAt)).toBe('2026-03-24T00:00');
		const february = recurringPeriods(
			{ startDate: '2026-01-31', endDate: '2026-02-27', weekdays: [6] },
			new Date('2026-01-01')
		);
		expect(toLocalDateTimeString(february.at(-1)!.startAt)).toBe('2026-02-21T00:00');
	});
	it('keeps local midnights across both daylight saving transitions', () => {
		for (const [startDate, expectedHours] of [
			['2026-03-29', 23],
			['2026-10-25', 25]
		] as const) {
			const [period] = recurringPeriods(
				{ startDate, endDate: startDate, weekdays: [0] },
				new Date('2026-01-01')
			);
			expect(toLocalDateTimeString(period.startAt)).toBe(`${startDate}T00:00`);
			expect((period.endAt.getTime() - period.startAt.getTime()) / 3600000).toBe(expectedHours);
		}
	});
	it('omits expired occurrences', () => {
		const periods = recurringPeriods(
			{ startDate: '2026-09-01', endDate: '2026-09-30', weekdays: [2] },
			new Date('2026-09-16')
		);
		expect(periods).toHaveLength(2);
	});
	it('validates dates, weekday selection and bounded duration', () => {
		for (const change of [
			{ weekdays: [] },
			{ weekdays: [7] },
			{ endDate: '2026-08-31' },
			{ endDate: '2028-01-01' },
			{ endDate: 'bad' },
			{ startDate: '2026-02-30' }
		]) {
			expect(
				recurringAvailabilitySchema.safeParse({
					startDate: '2026-09-01',
					endDate: '2026-09-30',
					weekdays: [2],
					...change
				}).success
			).toBe(false);
		}
		expect(dateRangeSchema.safeParse({ startDate: 'bad', endDate: '2026-09-30' }).success).toBe(
			false
		);
	});
});

describe('whole day date ranges', () => {
	it('includes the end date even across years', () => {
		const period = wholeDayPeriod('2026-12-28', '2027-01-03');
		expect(toLocalDateTimeString(period.startAt)).toBe('2026-12-28T00:00');
		expect(toLocalDateTimeString(period.endAt)).toBe('2027-01-04T00:00');
	});
	it('handles a daylight saving week as seven local days', () => {
		const period = wholeDayPeriod('2026-03-23', '2026-03-29');
		expect(toLocalDateTimeString(period.startAt)).toBe('2026-03-23T00:00');
		expect(toLocalDateTimeString(period.endAt)).toBe('2026-03-30T00:00');
		expect((period.endAt.getTime() - period.startAt.getTime()) / 3600000).toBe(167);
	});
});

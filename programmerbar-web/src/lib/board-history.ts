import { z } from 'zod';

export type Semester = `Vår ${number}` | `Høst ${number}`;

export function semesterIndex(semester: Semester): number {
	const [season, year] = semester.split(' ');
	return Number(year) * 2 + (season === 'Høst' ? 1 : 0);
}

const semesterSchema = z
	.string()
	.regex(/^(Vår|Høst) (19|20|21)\d{2}$/, 'Bruk for eksempel Høst 2025 eller Vår 2026.')
	.transform((value) => value as Semester);

const periodSchema = z
	.object({
		start: semesterSchema.optional(),
		end: semesterSchema.optional()
	})
	.refine(
		(period) =>
			!period.start || !period.end || semesterIndex(period.start) <= semesterIndex(period.end),
		{
			message: 'Sluttsemester kan ikke være før startsemester.'
		}
	);

export const boardMemberSchema = z
	.object({
		name: z.string().trim().min(1, 'Skriv inn et navn.').max(150),
		category: z.enum(['current', 'past', 'founder']),
		membership: periodSchema.optional(),
		roles: z
			.array(
				z.object({
					title: z.string().trim().min(1, 'Skriv inn navnet på vervet.').max(150),
					period: periodSchema.optional()
				})
			)
			.max(30)
	})
	.refine((member) => member.category !== 'current' || !member.membership?.end, {
		message: 'Velg tidligere medlem når medlemsperioden har et sluttsemester.'
	});

export type BoardMemberInput = z.infer<typeof boardMemberSchema>;
export type Period = NonNullable<BoardMemberInput['membership']>;
export type BoardMember = BoardMemberInput & { id: string; revision: number; sortOrder: number };

export function sortByFirstMembership<T extends BoardMemberInput>(members: T[]): T[] {
	function firstStart(member: T): number {
		const starts = [member.membership?.start, ...member.roles.map((role) => role.period?.start)]
			.filter((start): start is Semester => !!start)
			.map(semesterIndex);
		return starts.length ? Math.min(...starts) : -Infinity;
	}
	// Stable sorting preserves the existing order for equal or unknown start dates.
	return [...members].sort((a, b) => firstStart(a) - firstStart(b));
}

export function visibleRoles(
	member: BoardMemberInput,
	year: string,
	history: boolean,
	now = new Date()
): BoardMemberInput['roles'] {
	if (year !== 'all')
		return member.roles.filter((role) =>
			overlapsYear(role.period, Number(year), member.category === 'current')
		);
	if (member.category !== 'current' || history) return member.roles;
	const semester = now.getUTCFullYear() * 2 + (now.getUTCMonth() >= 6 ? 1 : 0);
	return member.roles.filter(
		(role) =>
			(!role.period?.start || semesterIndex(role.period.start) <= semester) &&
			(!role.period?.end || semesterIndex(role.period.end) >= semester)
	);
}

export function formatPeriod(start?: string, end?: string, current = false): string {
	if (start && end) return start === end ? start : `${start} – ${end.toLowerCase()}`;
	if (end) return `Til og med ${end.toLowerCase()}`;
	if (start) return current ? `${start} – nå` : `Fra ${start.toLowerCase()}`;
	return '';
}

export function overlapsYear(period: Period | undefined, year: number, current: boolean): boolean {
	if (!period?.start && !period?.end) return false;
	// Unknown boundaries must not imply membership in earlier/later years.
	const start = semesterIndex((period.start ?? period.end)!);
	const end = period.end ? semesterIndex(period.end) : current ? Infinity : start;
	return start <= (year + 1) * 2 && end >= year * 2 + 1;
}

export function getBoardYears(members: BoardMemberInput[]): number[] {
	const years = members.flatMap((member) =>
		[member.membership, ...member.roles.map((role) => role.period)].flatMap((period) =>
			[period?.start, period?.end].flatMap((semester) =>
				semester ? [Math.floor((semesterIndex(semester) - 1) / 2)] : []
			)
		)
	);
	return years.length
		? Array.from(
				{ length: Math.max(...years) - Math.min(...years) + 1 },
				(_, index) => Math.max(...years) - index
			)
		: [];
}

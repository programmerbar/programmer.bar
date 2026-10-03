import { error } from '@sveltejs/kit';
import { shiftStatistics, semesterFor, assignmentsInSemester, overlaps } from '$lib/shift-planning';
import { parseDateTimeLocal } from '$lib/utils/date';
import { z } from 'zod';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user?.role !== 'board') error(403, 'Du har ikke tilgang.');
	const { volunteers, assignments, absences, now } = await locals.shiftService.planningData();
	const requested = z
		.string()
		.regex(/^[1-9]\d{3}-[12]$/)
		.refine((value) => Number(value.slice(0, 4)) < 9999)
		.safeParse(url.searchParams.get('semester'));
	const semester = requested.success
		? semesterFor(
				parseDateTimeLocal(
					`${requested.data.slice(0, 4)}-${requested.data.endsWith('2') ? '07' : '01'}-01T00:00`
				)
			)
		: semesterFor(now);
	const semesters = [
		...new Map(
			[semesterFor(now), semester, ...assignments.map((shift) => semesterFor(shift.startAt))].map(
				(item) => [item.id, { id: item.id, label: item.label }]
			)
		).values()
	].sort((a, b) => b.id.localeCompare(a.id));
	const semesterAssignments = assignmentsInSemester(assignments, semester);
	return {
		semester: { id: semester.id, label: semester.label },
		semesters,
		users: volunteers
			.map((user) => ({
				...user,
				...shiftStatistics(user.id, semesterAssignments, now),
				absences: absences
					.filter((absence) => absence.userId === user.id && overlaps(absence, semester))
					.sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
			}))
			.sort((a, b) => a.completed - b.completed || a.name.localeCompare(b.name, 'nb'))
	};
};

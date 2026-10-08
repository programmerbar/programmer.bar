import { parseDateTimeLocal, toLocalDateTimeString } from './utils/date';

export type Interval = { startAt: Date; endAt: Date };

export function semesterFor(date: Date) {
	const local = toLocalDateTimeString(date);
	const year = Number(local.slice(0, 4));
	const autumn = Number(local.slice(5, 7)) >= 7;
	return {
		id: `${year}-${autumn ? '2' : '1'}`,
		label: `${autumn ? 'Høst' : 'Vår'} ${year}`,
		startAt: parseDateTimeLocal(`${year}-${autumn ? '07' : '01'}-01T00:00`),
		endAt: parseDateTimeLocal(`${autumn ? year + 1 : year}-${autumn ? '01' : '07'}-01T00:00`)
	};
}

// A shift belongs to the semester in which it starts, in Norwegian time.
export function assignmentsInSemester(assignments: Assignment[], semester: Interval) {
	return assignments.filter(
		(shift) => shift.startAt >= semester.startAt && shift.startAt < semester.endAt
	);
}
export type Assignment = Interval & { userId: string; shiftId: string; eventId: string };
export type Absence = Interval & { userId: string };
export type Volunteer = { id: string; name: string; role: string; tieBreaker?: number };
export type PlannedShift = Interval & { users: string[] };

export function overlaps(a: Interval, b: Interval) {
	return a.startAt < b.endAt && b.startAt < a.endAt;
}

export function shiftStatistics(userId: string, assignments: Assignment[], now: Date) {
	const own = assignments.filter((assignment) => assignment.userId === userId);
	const completed = own.filter((assignment) => assignment.endAt <= now);
	return {
		completed: completed.length,
		upcoming: own.filter((assignment) => assignment.endAt > now).length,
		lastShift: completed.reduce<Date | null>(
			(last, shift) => (!last || shift.endAt > last ? shift.endAt : last),
			null
		)
	};
}

// Completed shifts come first, then distance to the nearest past or planned shift.
// Both criteria use the target semester; saved random draws break remaining ties.
export function rankVolunteers(
	volunteers: Volunteer[],
	assignments: Assignment[],
	absences: Absence[],
	target: Interval,
	now: Date
) {
	const fortnight = 14 * 24 * 60 * 60 * 1000;
	const semesterAssignments = assignmentsInSemester(assignments, semesterFor(target.startAt));
	return volunteers
		.filter((user) => user.role === 'normal' || user.role === 'board')
		.map((user) => {
			const own = assignments.filter((assignment) => assignment.userId === user.id);
			const unavailable = absences.some(
				(absence) => absence.userId === user.id && overlaps(absence, target)
			);
			const busy = own.some((assignment) => overlaps(assignment, target));
			const semesterOwn = semesterAssignments.filter((assignment) => assignment.userId === user.id);
			const distance = semesterOwn.reduce(
				(nearest, assignment) =>
					Math.min(
						nearest,
						Math.max(
							0,
							target.startAt.getTime() - assignment.endAt.getTime(),
							assignment.startAt.getTime() - target.endAt.getTime()
						)
					),
				Infinity
			);
			return {
				...user,
				...shiftStatistics(user.id, semesterAssignments, now),
				unavailable,
				busy,
				recent: distance < fortnight,
				nearestShiftDistance: distance
			};
		})
		.sort((a, b) => {
			if (a.completed !== b.completed) return a.completed - b.completed;
			if (a.nearestShiftDistance !== b.nearestShiftDistance) {
				return a.nearestShiftDistance > b.nearestShiftDistance ? -1 : 1;
			}
			return (a.tieBreaker ?? 0) - (b.tieBreaker ?? 0);
		});
}

export function findPlanningConflict(
	planned: PlannedShift[],
	assignments: Assignment[],
	absences: Absence[]
) {
	for (const [index, shift] of planned.entries()) {
		for (const userId of shift.users) {
			if (absences.some((absence) => absence.userId === userId && overlaps(absence, shift))) {
				return 'En valgt person har registrert at de ikke kan stå i denne perioden. Fjern personen eller endre tidspunktet.';
			}
			if (
				assignments.some(
					(assignment) => assignment.userId === userId && overlaps(assignment, shift)
				) ||
				planned
					.slice(0, index)
					.some((other) => other.users.includes(userId) && overlaps(other, shift))
			) {
				return 'En valgt person har en annen vakt som overlapper. Fjern personen eller endre tidspunktet.';
			}
		}
	}
	return null;
}

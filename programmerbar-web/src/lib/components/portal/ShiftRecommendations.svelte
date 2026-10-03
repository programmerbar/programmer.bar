<script lang="ts">
	import {
		rankVolunteers,
		semesterFor,
		type Assignment,
		type Absence,
		type Volunteer
	} from '$lib/shift-planning';
	import { parseDateTimeLocal, formatDate } from '$lib/utils/date';
	import Button from '$lib/components/ui/Button.svelte';
	import { Tooltip } from 'bits-ui';
	import { Info } from '@lucide/svelte';

	type Draft = { startAt: string; endAt: string; users: { id: string; name: string }[] };
	let {
		planning,
		drafts,
		index,
		onselect
	}: {
		planning: {
			assignments: Assignment[];
			absences: Absence[];
			volunteers: Volunteer[];
			now: Date;
		};
		drafts: Draft[];
		index: number;
		onselect: (user: { id: string; name: string }) => void;
	} = $props();
	let search = $state('');
	const target = $derived({
		startAt: parseDateTimeLocal(drafts[index].startAt),
		endAt: parseDateTimeLocal(drafts[index].endAt)
	});
	const valid = $derived(
		Number.isFinite(target.startAt.getTime()) && target.endAt > target.startAt
	);
	const assignments = $derived([
		...planning.assignments,
		...drafts.flatMap((shift, i) =>
			i === index
				? []
				: shift.users
						.filter((user) => user.id)
						.map((user) => ({
							userId: user.id,
							shiftId: `draft-${i}`,
							eventId: 'draft',
							startAt: parseDateTimeLocal(shift.startAt),
							endAt: parseDateTimeLocal(shift.endAt)
						}))
						.filter(
							(assignment) =>
								Number.isFinite(assignment.startAt.getTime()) &&
								assignment.endAt > assignment.startAt
						)
		)
	]);
	const ranked = $derived(
		valid
			? rankVolunteers(planning.volunteers, assignments, planning.absences, target, planning.now)
			: []
	);
	const available = $derived(
		ranked.filter((user) => !drafts[index].users.some((selected) => selected.id === user.id))
	);
	const matching = $derived(
		available.filter((user) =>
			user.name.toLocaleLowerCase('nb').includes(search.toLocaleLowerCase('nb'))
		)
	);
	const recommended = $derived(
		matching.filter((user) => user.role === 'normal' && !user.unavailable && !user.busy)
	);
	const others = $derived(
		matching.filter((user) => user.role === 'board' || user.unavailable || user.busy)
	);
</script>

<div class="my-4 space-y-3 rounded-lg border p-4">
	<div class="flex items-center gap-2">
		<h4 class="font-semibold">Anbefalte frivillige</h4>
		<Tooltip.Provider delayDuration={150}>
			<Tooltip.Root>
				<Tooltip.Trigger
					type="button"
					aria-label="Om anbefalte frivillige"
					class="rounded-full p-1 text-gray-500 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-gray-400 dark:hover:text-gray-100"
				>
					<Info class="size-4" aria-hidden="true" />
				</Tooltip.Trigger>
				<Tooltip.Portal>
					<Tooltip.Content
						side="top"
						sideOffset={6}
						class="z-50 max-w-[min(20rem,calc(100vw-2rem))] rounded-lg bg-gray-900 px-4 py-3 text-sm text-white shadow-lg"
					>
						Bare vakter i samme semester teller. Færre vakter gir høyere prioritet, og vakter
						innenfor 14 dager i semesteret trekker ned. Ved lik poengsum trekkes rekkefølgen
						tilfeldig når siden lastes. Styret velges manuelt. Vår: januar–juni. Høst:
						juli–desember.
					</Tooltip.Content>
				</Tooltip.Portal>
			</Tooltip.Root>
		</Tooltip.Provider>
	</div>
	{#if !valid}
		<p class="text-sm">Velg start og slutt for å se anbefalinger.</p>
	{:else}
		<p class="text-sm font-medium">
			{semesterFor(target.startAt).label}
		</p>
		<label class="flex flex-col gap-1 text-sm"
			>Søk etter frivillig
			<input type="search" bind:value={search} class="bg-portal-card rounded border p-2" />
		</label>
		<div class="max-h-80 space-y-2 overflow-y-auto">
			{#each recommended as user (user.id)}
				<div class="flex items-center justify-between gap-3 border-b py-2">
					<div class="text-sm">
						<p class="font-medium">{user.name}</p>
						<p>
							{user.completed} fullført · {user.upcoming} kommende · Siste: {user.lastShift
								? formatDate(user.lastShift)
								: 'Ingen'}
						</p>
						{#if user.recent}<p>Har vakt innenfor 14 dager av denne vakten</p>{/if}
					</div>
					<Button
						type="button"
						size="sm"
						intent="outline"
						onclick={() => onselect({ id: user.id, name: user.name })}>Velg</Button
					>
				</div>
			{:else}<p class="text-sm">Ingen tilgjengelige frivillige som passer søket.</p>{/each}
		</div>
		<details>
			<summary class="cursor-pointer text-sm">Styret og utilgjengelige ({others.length})</summary>
			{#each others as user (user.id)}
				<div class="flex items-center justify-between gap-3 border-b py-2 text-sm">
					<div>
						<p>{user.name}{user.role === 'board' ? ' · Styret (valgfritt)' : ''}</p>
						{#if user.unavailable}<p>Kan ikke stå i denne perioden</p>{/if}
						{#if user.busy}<p>Overlappende vakt</p>{/if}
					</div>
					<Button
						type="button"
						size="sm"
						intent="outline"
						disabled={user.unavailable || user.busy}
						onclick={() => onselect({ id: user.id, name: user.name })}>Velg</Button
					>
				</div>
			{/each}
		</details>
		{#each ranked.filter((user) => (user.unavailable || user.busy) && drafts[index].users.some((selected) => selected.id === user.id)) as user (user.id)}
			<p role="alert" class="text-sm text-red-600 dark:text-red-400">
				{user.name}: {user.unavailable ? 'Kan ikke stå i denne perioden' : 'Overlappende vakt'}.
				Fjern personen eller endre tidspunktet før du lagrer.
			</p>
		{/each}
	{/if}
</div>

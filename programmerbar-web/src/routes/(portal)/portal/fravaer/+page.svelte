<script lang="ts">
	import { enhance } from '$app/forms';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { checkboxClass } from '$lib/components/styles/checkbox';
	import { normalDate, formatDate, parseDateTimeLocal } from '$lib/utils/date';
	import { recurringPeriods, recurringAvailabilitySchema } from '$lib/availability-periods';
	let { data, form } = $props();
	let mode = $state('single');
	let startDate = $state('');
	let endDate = $state('');
	let allDay = $state(true);
	let startTime = $state('');
	let endTime = $state('');
	let weekdays = $state<string[]>([]);
	let saving = $state(false);
	let selectedIds = $state<string[]>([]);
	const selected = $derived(
		selectedIds.filter((id) =>
			data.groups.some((group) => !group.groupId && group.periods[0].id === id)
		)
	);
	const days = [
		{ value: '1', label: 'Mandag' },
		{ value: '2', label: 'Tirsdag' },
		{ value: '3', label: 'Onsdag' },
		{ value: '4', label: 'Torsdag' },
		{ value: '5', label: 'Fredag' },
		{ value: '6', label: 'Lørdag' },
		{ value: '0', label: 'Søndag' }
	];
	const selection = $derived(
		recurringAvailabilitySchema.safeParse({
			startDate,
			endDate,
			weekdays,
			allDay,
			startTime,
			endTime
		})
	);
	const preview = $derived(
		selection.success
			? recurringPeriods(selection.data, parseDateTimeLocal(`${data.today}T00:00`))
			: []
	);
</script>

<svelte:head><title>Når jeg ikke kan stå</title></svelte:head>
<section class="space-y-6">
	<Heading level={1}>Når jeg ikke kan stå</Heading>
	<p>
		Velg datoene du ikke kan stå. Har du allerede en vakt, må du kontakte frivilligansvarlig for å
		bytte.
	</p>
	{#if form?.message}<p role="status" class="rounded-lg border p-4">{form.message}</p>{/if}
	<form
		method="post"
		action={mode === 'recurring' ? '?/recurring' : '?/add'}
		use:enhance={() => {
			saving = true;
			return async ({ update }) => {
				try {
					await update({ reset: false });
				} finally {
					saving = false;
				}
			};
		}}
		class="bg-portal-card space-y-5 rounded-lg border p-5"
	>
		<fieldset disabled={saving} class="space-y-5">
			<legend class="sr-only">Registrer når du ikke kan stå</legend>
			<div class="flex flex-wrap gap-4">
				<label class="flex items-center gap-2"
					><input type="radio" name="mode" value="single" bind:group={mode} />En periode</label
				>
				<label class="flex items-center gap-2"
					><input type="radio" name="mode" value="recurring" bind:group={mode} />Faste ukedager</label
				>
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<label class="flex flex-col gap-2"
					>Fra dato<Input
						type="date"
						name="startDate"
						bind:value={startDate}
						min={data.today}
						required
					/></label
				>
				<label class="flex flex-col gap-2"
					>Til og med<Input
						type="date"
						name="endDate"
						bind:value={endDate}
						min={startDate || data.today}
						required={mode === 'recurring'}
						aria-describedby={mode === 'single' ? 'end-date-hint' : undefined}
					/>
					{#if mode === 'single'}
						<span id="end-date-hint" class="text-sm text-gray-500 dark:text-gray-400"
							>La stå tomt for samme dato som «Fra dato».</span
						>
					{/if}</label
				>
			</div>
			<label class="flex items-center gap-2"
				><input type="checkbox" class={checkboxClass} bind:checked={allDay} />Hele dager</label
			>
			<input type="hidden" name="allDay" value={String(allDay)} />
			{#if !allDay}
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="flex flex-col gap-2"
						>Fra klokken<Input
							type="time"
							name="startTime"
							bind:value={startTime}
							required
						/></label
					>
					<label class="flex flex-col gap-2"
						>Til klokken<Input type="time" name="endTime" bind:value={endTime} required /></label
					>
				</div>
				<p class="text-sm">
					{#if mode === 'recurring'}
						Samme klokkeslett hver valgt ukedag. Slutt før start betyr neste dag; bruk 00:00 for
						midnatt. Norsk tid.
					{:else}
						Fra klokkeslettet på startdatoen til klokkeslettet på sluttdatoen. Norsk tid.
					{/if}
				</p>
			{:else if mode === 'single'}
				<p class="text-sm">Alle dager i perioden tas med, også sluttdatoen.</p>
			{/if}
			{#if mode === 'recurring'}
				<fieldset class="space-y-2">
					<legend class="mb-2 font-medium">Hvilke ukedager?</legend>
					<div class="flex flex-wrap gap-4">
						{#each days as day (day.value)}
							<label class="flex items-center gap-2"
								><input
									type="checkbox"
									class={checkboxClass}
									name="weekdays"
									value={day.value}
									bind:group={weekdays}
								/>{day.label}</label
							>
						{/each}
					</div>
				</fieldset>
				<p class="text-sm">
					{allDay ? 'Gjelder hele dagen på' : 'Tidsrommet gjentas på'} valgte ukedager, til og med sluttdatoen.
				</p>
				{#if startDate && endDate && weekdays.length && !selection.success}
					<p role="status" class="text-sm">{selection.error.issues[0]?.message}</p>
				{:else if selection.success && !preview.length}
					<p role="status" class="text-sm">Ingen av de valgte ukedagene finnes i perioden.</p>
				{/if}
				{#if preview.length}
					<details class="text-sm">
						<summary class="cursor-pointer">{preview.length} dager valgt – se datoene</summary>
						<ul class="mt-2 max-h-48 overflow-y-auto">
							{#each preview as period (period.startAt.getTime())}<li>
									{allDay
										? formatDate(period.startAt)
										: `${normalDate(period.startAt)} – ${normalDate(period.endAt)}`}
								</li>{/each}
						</ul>
					</details>
				{/if}
			{/if}
			<Button type="submit" disabled={saving || (mode === 'recurring' && !preview.length)}
				>{saving ? 'Lagrer …' : 'Lagre'}</Button
			>
		</fieldset>
	</form>
	<Heading level={2}>Registrerte perioder</Heading>
	{#if selected.length}
		<form method="post" action="?/deleteSelected" use:enhance class="flex items-center gap-3">
			{#each selected as id (id)}<input type="hidden" name="ids" value={id} />{/each}
			<Button type="submit" intent="danger" size="sm">Slett valgte ({selected.length})</Button>
			<Button type="button" intent="outline" size="sm" onclick={() => (selectedIds = [])}
				>Opphev valg</Button
			>
		</form>
	{/if}
	{#each data.groups as group (group.key)}
		{#if group.groupId}
			<div class="bg-portal-card border-portal-border rounded-lg border p-4">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h3 class="font-medium">{group.label ?? 'Faste ukedager'}</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							{group.periods.length} dager registrert
						</p>
					</div>
					<form method="post" action="?/deleteGroup" use:enhance>
						<input type="hidden" name="groupId" value={group.groupId} />
						<Button type="submit" intent="danger" size="sm">Slett hele registreringen</Button>
					</form>
				</div>
				<details class="mt-3">
					<summary class="cursor-pointer text-sm font-medium">Vis dager / fjern enkeltdager</summary
					>
					<ul class="divide-portal-border mt-2 divide-y">
						{#each group.periods as absence (absence.id)}
							<li class="flex flex-wrap items-center justify-between gap-3 py-3">
								<span>{normalDate(absence.startAt)} – {normalDate(absence.endAt)}</span>
								<form method="post" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={absence.id} />
									<Button
										type="submit"
										intent="outline"
										size="sm"
										aria-label={`Fjern ${formatDate(absence.startAt)}`}>Fjern denne dagen</Button
									>
								</form>
							</li>
						{/each}
					</ul>
				</details>
			</div>
		{:else}
			{@const absence = group.periods[0]}
			<div
				class="bg-portal-card flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
			>
				<label class="flex items-center gap-3">
					<input
						type="checkbox"
						class={checkboxClass}
						value={absence.id}
						bind:group={selectedIds}
						aria-label={`Velg perioden ${normalDate(absence.startAt)} – ${normalDate(absence.endAt)}`}
					/>
					<span>{normalDate(absence.startAt)} – {normalDate(absence.endAt)}</span>
				</label>
				<form method="post" action="?/delete" use:enhance>
					<input type="hidden" name="id" value={absence.id} />
					<Button type="submit" intent="danger" size="sm">Slett</Button>
				</form>
			</div>
		{/if}
	{:else}<p>Du har ikke registrert noen perioder du ikke kan stå.</p>{/each}
</section>

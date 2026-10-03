<script lang="ts">
	import { enhance } from '$app/forms';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { normalDate, formatDate, parseDateTimeLocal } from '$lib/utils/date';
	import { recurringPeriods, recurringAvailabilitySchema } from '$lib/availability-periods';
	let { data, form } = $props();
	let mode = $state('single');
	let startDate = $state('');
	let endDate = $state('');
	let allDay = $state(true);
	let weekdays = $state<string[]>([]);
	let saving = $state(false);
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
		recurringAvailabilitySchema.safeParse({ startDate, endDate, weekdays })
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
			{#if mode === 'recurring'}
				<fieldset class="space-y-2">
					<legend class="mb-2 font-medium">Hvilke ukedager?</legend>
					<div class="flex flex-wrap gap-4">
						{#each days as day (day.value)}
							<label class="flex items-center gap-2"
								><input
									type="checkbox"
									name="weekdays"
									value={day.value}
									bind:group={weekdays}
								/>{day.label}</label
							>
						{/each}
					</div>
				</fieldset>
				<p class="text-sm">Gjelder hele dagen på valgte ukedager, til og med sluttdatoen.</p>
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
									{formatDate(period.startAt)}
								</li>{/each}
						</ul>
					</details>
				{/if}
			{:else}
				<label class="flex items-center gap-2"
					><input type="checkbox" bind:checked={allDay} />Hele dager</label
				>
				<input type="hidden" name="allDay" value={String(allDay)} />
				{#if !allDay}
					<div class="grid gap-4 sm:grid-cols-2">
						<label class="flex flex-col gap-2"
							>Fra klokken<Input type="time" name="startTime" required /></label
						>
						<label class="flex flex-col gap-2"
							>Til klokken<Input type="time" name="endTime" required /></label
						>
					</div>
					<p class="text-sm">
						Fra klokkeslettet på startdatoen til klokkeslettet på sluttdatoen. Norsk tid.
					</p>
				{:else}
					<p class="text-sm">Alle dager i perioden tas med, også sluttdatoen.</p>
				{/if}
			{/if}
			<Button type="submit" disabled={saving || (mode === 'recurring' && !preview.length)}
				>{saving ? 'Lagrer …' : 'Lagre'}</Button
			>
		</fieldset>
	</form>
	<Heading level={2}>Registrerte perioder</Heading>
	{#each data.absences as absence (absence.id)}
		<div
			class="bg-portal-card flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4"
		>
			<p>{normalDate(absence.startAt)} – {normalDate(absence.endAt)}</p>
			<form method="post" action="?/delete" use:enhance>
				<input type="hidden" name="id" value={absence.id} />
				<Button type="submit" intent="danger" size="sm">Slett</Button>
			</form>
		</div>
	{:else}<p>Du har ikke registrert noen perioder du ikke kan stå.</p>{/each}
</section>

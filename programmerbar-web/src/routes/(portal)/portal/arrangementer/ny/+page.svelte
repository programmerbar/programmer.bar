<script lang="ts">
	import type { EventHandler } from 'svelte/elements';
	import { X, Plus, Save, Clock } from '@lucide/svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import FormInput from '$lib/components/ui/form/FormInput.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Combobox from '$lib/components/ui/Combobox.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { CreateEventState } from '$lib/states/create-event-state.svelte';
	import { differenceInHours } from 'date-fns';
	import { createEvent } from '$lib/api/remotes/events.remote';
	import { resolve } from '$app/paths';

	let { data } = $props();
	let error = $state('');
	let successMessage = $state('');
	let isSubmitting = $state(false);
	let createEventState = new CreateEventState();
	let slugError = $derived.by(() =>
		createEventState.shouldBePublic && data.allSlugs.includes(createEventState.slug)
			? 'Denne lenken er allerede i bruk. Velg et annet navn eller beskrivelse.'
			: ''
	);

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
		e.preventDefault();
		if (!createEventState.isValid()) {
			error = 'Vennligst fyll ut alle feltene';
			return;
		}

		if (slugError) {
			error = slugError;
			return;
		}

		isSubmitting = true;
		error = '';
		successMessage = '';

		try {
			const { success } = await createEvent(createEventState.json());

			if (success) {
				successMessage = 'Arrangement opprettet! E-post er sendt.';
				createEventState.reset();
			} else {
				error = 'Noe gikk galt ved oppretting av arrangement';
			}
		} catch (err) {
			error = 'Server error';
			console.error(err);
		} finally {
			isSubmitting = false;
		}
	};
</script>

<svelte:head>
	<title>Nytt arrangement</title>
</svelte:head>

<div class="space-y-8">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-2">
			<Heading level={1}>Nytt arrangement</Heading>
			<p class="text-sm text-gray-600 dark:text-gray-300">
				Opprett arrangementet, legg til vakter og inviter ansvarlige i én og samme arbeidsflyt.
			</p>
		</div>
		<a href={resolve('/portal/arrangementer')} class="sm:ml-auto">
			<Button type="button" intent="outline" class="w-full sm:w-auto">Til arrangementer</Button>
		</a>
	</div>

	{#if error}
		<div
			class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300"
		>
			<p class="font-medium">Vi mangler litt informasjon</p>
			<p class="mt-1 text-red-600 dark:text-red-400">{error}</p>
		</div>
	{/if}

	{#if successMessage}
		<div
			class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300"
		>
			<p class="font-medium">{successMessage}</p>
			<p class="mt-1 text-green-600 dark:text-green-400">
				Det nye arrangementet ligger nå i oversikten din under «Arrangementer».
			</p>
		</div>
	{/if}

	<form onsubmit={handleSubmit} class="space-y-8">
		<section
			class="bg-portal-card dark:border-portal-border space-y-6 rounded-lg border border-gray-200 p-6"
		>
			<div>
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Arrangementsdetaljer</h2>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Sett navn og tidspunkt for arrangementet. Du kan gjøre det offentlig når du er klar.
				</p>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<FormInput
					label="Navn"
					description="Navn på arrangementet som vises for medlemmene"
					bind:error={slugError}
					placeholder="Fest med Foobar"
					bind:value={createEventState.name}
					required
				/>
				<FormInput
					label="Dato"
					description="Starttidspunkt for arrangementet"
					bind:value={createEventState.date}
					type="datetime-local"
					required
				/>
			</div>

			<div
				class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-100 bg-gray-50 p-4"
			>
				<Checkbox
					id="shouldBePublic"
					bind:checked={createEventState.shouldBePublic}
					label="Gjør arrangementet offentlig"
				/>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Offentlige arrangementer publiseres på nettsiden og får automatisk en egen beskrivelse.
				</p>

				{#if createEventState.shouldBePublic}
					<div class="mt-4 space-y-2">
						<label
							for="description"
							class="block text-sm font-medium text-gray-700 dark:text-gray-200"
						>
							Beskrivelse
						</label>
						<p class="text-xs text-gray-500 dark:text-gray-400">
							Beskriv hva som skjer – teksten vises offentlig. Slug foreslås automatisk fra navnet,
							men kan endres senere ved behov. Støtter Markdown-formattering.
						</p>
						<Textarea
							id="description"
							bind:value={createEventState.description}
							placeholder="Skriv en kort og selgende beskrivelse…"
							class="min-h-28"
						/>
						{#if createEventState.slug}
							<p class="text-xs text-gray-500 dark:text-gray-400">
								Lenkeforslag: programmer.bar/arrangementer/{createEventState.slug}
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</section>

		<section
			class="bg-portal-card dark:border-portal-border space-y-6 rounded-lg border border-gray-200 p-6"
		>
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Vakter</h2>
					<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
						Legg til vakter og tildel ansvarlige. Alle får e-post med kalenderinvitasjon automatisk.
					</p>
				</div>
				<Button
					type="button"
					intent="primary"
					size="sm"
					class="w-full sm:w-auto"
					onclick={() => createEventState.addShift()}
				>
					<Plus size={16} class="mr-1" />
					Legg til vakt
				</Button>
			</div>

			<div class="space-y-4">
				{#each createEventState.shifts as shift, i (i + shift.startAt.toString() + shift.endAt.toString())}
					{@const hasTimes = Boolean(shift.startAt && shift.endAt)}
					{@const shiftLength = hasTimes
						? differenceInHours(new Date(shift.endAt), new Date(shift.startAt))
						: 0}

					<article
						class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-5"
					>
						<div class="flex items-start justify-between gap-3">
							<div class="flex items-center gap-3">
								<div
									class="dark:bg-portal-card flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-gray-600 dark:text-gray-300"
								>
									{i + 1}
								</div>
								<div>
									<h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
										Vakt {i + 1}
									</h3>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										Angi start, slutt og hvem som har ansvar.
									</p>
								</div>
							</div>
							<button
								type="button"
								class="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
								onclick={() => createEventState.deleteShift(i)}
								aria-label={`Slett vakt ${i + 1}`}
							>
								<X class="h-4 w-4" />
							</button>
						</div>

						<div class="mt-4 grid gap-4 sm:grid-cols-2">
							<FormInput
								label="Start"
								description="Når vakten starter"
								bind:value={shift.startAt}
								type="datetime-local"
								required
							/>
							<FormInput
								label="Slutt"
								description="Når vakten slutter"
								bind:value={shift.endAt}
								type="datetime-local"
								required
							/>
						</div>

						{#if hasTimes && shiftLength > 4}
							<div
								class="mt-3 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
							>
								<Clock size={16} />
								<span>Vakten er lengre enn 4 timer – dobbeltsjekk bemanningen.</span>
							</div>
						{/if}

						<div
							class="dark:border-portal-border dark:bg-portal-card mt-5 rounded-lg border border-gray-200 bg-white p-4"
						>
							<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Ansvarlige</h4>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										De som legges til her mottar kalenderinvitasjon og varsling på e-post.
									</p>
								</div>
								<Button
									type="button"
									onclick={() => createEventState.addUserToShift(i)}
									intent="outline"
									size="sm"
									class="w-full sm:w-auto"
								>
									<Plus size={14} class="mr-1" />
									Legg til ansvarlig
								</Button>
							</div>

							<div class="mt-4 space-y-3">
								{#each createEventState.shifts[i].users as user, j (user.id)}
									<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
										<Combobox
											type="single"
											name="user"
											inputValue={createEventState.shifts[i].users[j].name}
											bind:value={createEventState.shifts[i].users[j].id}
											disabledOptions={createEventState.shifts[i].users.map((user) => user.id)}
											onValueChange={(option) => {
												const selectedUser = data.users.find((u) => u.value === option);
												if (selectedUser) {
													createEventState.shifts[i].users[j].id = option;
													createEventState.shifts[i].users[j].name = selectedUser.label;
												}
											}}
											items={data.users}
											inputProps={{
												class: 'w-full',
												placeholder: 'Velg ansvarlig'
											}}
										/>
										<button
											type="button"
											class="dark:border-portal-border dark:bg-portal-card flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:text-red-500 dark:text-gray-300 dark:hover:border-red-800 dark:hover:text-red-400"
											onclick={() => createEventState.deleteUserFromShift(i, user.id)}
										>
											Fjern
										</button>
									</div>
								{:else}
									<p class="text-sm text-gray-500 italic dark:text-gray-400">
										Ingen ansvarlige lagt til ennå. Husk å invitere minst én person.
									</p>
								{/each}
							</div>
						</div>
					</article>
				{:else}
					<div
						class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:text-gray-400"
					>
						Ingen vakter lagt til ennå. Trykk «Legg til vakt» for å starte planleggingen.
					</div>
				{/each}
			</div>
		</section>

		<div
			class="dark:border-portal-border flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end"
		>
			<a href={resolve('/portal/arrangementer')} class="sm:w-auto">
				<Button type="button" intent="outline" class="w-full sm:w-auto">Avbryt</Button>
			</a>
			<Button
				type="submit"
				intent="primary"
				disabled={isSubmitting}
				class="flex w-full items-center justify-center gap-2 sm:w-auto"
			>
				<Save size={16} />
				{isSubmitting ? 'Lagrer…' : 'Opprett arrangement'}
			</Button>
		</div>
	</form>
</div>

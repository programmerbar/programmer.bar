<script lang="ts">
	import { X, Plus, Save, Trash2, Clock } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormInput from '$lib/components/ui/form/FormInput.svelte';
	import Combobox from '$lib/components/ui/Combobox.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { enhance } from '$app/forms';
	import { CreateEventState } from '$lib/states/create-event-state.svelte';
	import { toDateTimeLocalInput } from '$lib/utils/date.js';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { differenceInHours } from 'date-fns';

	let { data } = $props();

	let showDeleteConfirm = $state(false);

	const eventState = new CreateEventState();

	onMount(() => {
		eventState.name = data.event.name;
		eventState.date = toDateTimeLocalInput(data.event.date);
		eventState.description = data.event.description || '';
		eventState.shouldBePublic = !!(data.event.description || data.event.slug);

		console.log(data.event);
		console.log(eventState.shouldBePublic);

		data.event.shifts.forEach((shift) => {
			eventState.shifts.push({
				startAt: toDateTimeLocalInput(shift.startAt),
				endAt: toDateTimeLocalInput(shift.endAt),
				users: shift.members.map((member) => ({
					id: member.user.id,
					name: member.user.name
				}))
			});
		});
	});

	let originalShifts = $state(data.event.shifts.map((shift) => ({ id: shift.id })));
	let deletedShiftIds = $state<Array<string>>([]);
	let removedUserShifts = $state<Array<string>>([]);
</script>

<svelte:head>
	<title>Rediger arrangement: {eventState.name}</title>
</svelte:head>

<div class="space-y-10">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
		<div class="space-y-2">
			<Heading level={1}>Rediger arrangementet</Heading>
			<p class="text-sm text-gray-600 dark:text-gray-300">
				Oppdater detaljer, bemanning og publiseringsstatus for arrangementet. Endringene lagres ikke
				automatisk.
			</p>
		</div>
		<form method="POST" action="?/delete" use:enhance>
			<Button
				type="submit"
				intent="danger"
				class="w-full sm:w-auto"
				onclick={(e) => {
					if (!showDeleteConfirm) {
						e.preventDefault();
						showDeleteConfirm = true;
					}
				}}
			>
				<Trash2 class="mr-1 h-4 w-4" />
				{showDeleteConfirm ? 'Er du sikker?' : 'Slett'}
			</Button>
		</form>
	</div>

	{#if deletedShiftIds.length > 0 || removedUserShifts.length > 0}
		<div
			class="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
		>
			<p class="font-medium">Ulagrede endringer</p>
			<ul class="mt-1 space-y-1">
				{#if deletedShiftIds.length > 0}
					<li>
						• {deletedShiftIds.length} vakt{deletedShiftIds.length > 1 ? 'er' : ''} blir slettet ved lagring
					</li>
				{/if}
				{#if removedUserShifts.length > 0}
					<li>
						• {removedUserShifts.length} ansvarlig{removedUserShifts.length > 1 ? 'e' : ''}
						fjernes fra vakter
					</li>
				{/if}
			</ul>
		</div>
	{/if}

	<form method="post" action="?/save" use:enhance class="space-y-8">
		<input type="hidden" name="shiftsCount" value={eventState.shifts.length} />
		<input type="hidden" name="shouldBePublic" value={eventState.shouldBePublic} />
		<input type="hidden" name="slug" value={eventState.shouldBePublic ? eventState.slug : ''} />
		{#each deletedShiftIds as id (id)}
			<input type="hidden" name="deletedShiftIds" value={id} />
		{/each}
		{#each removedUserShifts as keyValue (keyValue)}
			<input type="hidden" name="removedUserShifts" value={keyValue} />
		{/each}

		<section
			class="bg-portal-card dark:border-portal-border space-y-6 rounded-lg border border-gray-200 p-6"
		>
			<div>
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Arrangementsdetaljer</h2>
				<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
					Oppdater navn, tidspunkt og offentlig informasjon for arrangementet.
				</p>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<FormInput label="Navn" name="name" class="border" bind:value={eventState.name} required />
				<FormInput
					label="Dato"
					name="date"
					bind:value={eventState.date}
					type="datetime-local"
					class="border"
					required
				/>
			</div>

			<div
				class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-100 bg-gray-50 p-4"
			>
				<Checkbox
					id="shouldBePublic"
					bind:checked={eventState.shouldBePublic}
					label="Vis arrangementet offentlig"
				/>
				<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
					Når arrangementet er offentlig synlig på nettsiden, trenger det en beskrivelse og slug.
				</p>

				{#if eventState.shouldBePublic}
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
							name="description"
							bind:value={eventState.description}
							placeholder="Oppdater beskrivelsen som vises offentlig…"
							class="min-h-28 border"
						/>
						{#if eventState.slug}
							<p class="text-xs text-gray-500 dark:text-gray-400">
								Lenke: programmer.bar/arrangementer/{eventState.slug}
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
						Legg til, fjern eller oppdater vakter og ansvarlige. Kalenderinvitasjoner sendes
						automatisk.
					</p>
				</div>
				<Button
					type="button"
					intent="primary"
					size="sm"
					class="w-full sm:w-auto"
					onclick={() => eventState.addShift()}
				>
					<Plus class="mr-1 h-4 w-4" />
					Legg til vakt
				</Button>
			</div>

			<div class="space-y-4">
				{#each eventState.shifts as shift, i (shift.startAt.toString() + shift.endAt.toString())}
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
										Oppdater start- og sluttid, og hvem som har ansvar.
									</p>
								</div>
							</div>
							<button
								type="button"
								class="rounded-full p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400"
								onclick={() => {
									if (i < originalShifts.length) {
										deletedShiftIds.push(originalShifts[i].id);
									}
									eventState.deleteShift(i);

									if (i < originalShifts.length) {
										originalShifts.splice(i, 1);
									}
								}}
							>
								<X class="h-4 w-4" />
							</button>
						</div>

						{#if i < originalShifts.length}
							<input type="hidden" name={`shift[${i}].id`} value={originalShifts[i].id} />
						{/if}

						<div class="mt-4 grid gap-4 sm:grid-cols-2">
							<FormInput
								label="Start"
								name={`shift[${i}].startAt`}
								bind:value={shift.startAt}
								type="datetime-local"
								required
							/>
							<FormInput
								label="Slutt"
								name={`shift[${i}].endAt`}
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
								<span>Vakten er lengre enn 4 timer – vurder ekstra bemanning.</span>
							</div>
						{/if}

						<div
							class="dark:border-portal-border dark:bg-portal-card mt-5 rounded-lg border border-gray-200 bg-white p-4"
						>
							<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Ansvarlige</h4>
									<p class="text-xs text-gray-500 dark:text-gray-400">
										Ansvarlige får e-post med kalenderinvitasjon når du lagrer endringene.
									</p>
								</div>
								<Button
									type="button"
									intent="outline"
									size="sm"
									class="w-full sm:w-auto"
									onclick={() => eventState.addUserToShift(i)}
								>
									<Plus class="mr-1 h-4 w-4" />
									Legg til ansvarlig
								</Button>
							</div>

							<input type="hidden" name={`shift[${i}].userCount`} value={shift.users.length} />

							{#if shift.users.length === 0}
								<p class="py-2 text-sm text-gray-500 italic dark:text-gray-400">
									Ingen ansvarlige lagt til ennå. Husk å invitere minst én.
								</p>
							{:else}
								<div class="mt-4 space-y-3">
									{#each shift.users as user, j (user.id)}
										<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
											<Combobox
												type="single"
												name="shift[{i}].user[{j}].id"
												inputValue={eventState.shifts[i].users[j].name}
												bind:value={eventState.shifts[i].users[j].id}
												items={data.users}
												disabledOptions={eventState.shifts[i].users
													.filter((u) => u.id && u.id !== user.id)
													.map((u) => u.id)}
												onValueChange={(option) => {
													const selectedUser = data.users.find((u) => u.value === option);
													if (selectedUser) {
														eventState.shifts[i].users[j].id = selectedUser.value;
														eventState.shifts[i].users[j].name = selectedUser.label;
													}
												}}
												inputProps={{
													class: 'w-full',
													placeholder: 'Velg ansvarlig'
												}}
											/>
											<button
												type="button"
												class="dark:border-portal-border dark:bg-portal-card flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 transition-colors hover:border-red-200 hover:text-red-500 dark:text-gray-300 dark:hover:border-red-800 dark:hover:text-red-400"
												onclick={() => {
													if (i < originalShifts.length && user.id) {
														removedUserShifts = [
															...removedUserShifts,
															`${originalShifts[i].id}|${user.id}`
														];
													}
													eventState.deleteUserFromShift(i, user.id);
												}}
											>
												Fjern
											</button>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</article>
				{:else}
					<div
						class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-portal-border dark:bg-portal-hover dark:text-gray-400"
					>
						Ingen vakter registrert. Legg til den første for å starte planleggingen.
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
				disabled={!eventState.isValid()}
				class="flex w-full items-center justify-center gap-2 sm:w-auto"
			>
				<Save class="h-4 w-4" />
				Lagre endringer
			</Button>
		</div>
	</form>
</div>

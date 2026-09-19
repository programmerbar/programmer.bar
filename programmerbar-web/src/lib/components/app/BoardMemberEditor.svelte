<script lang="ts">
	import { enhance } from '$app/forms';
	import { untrack } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { BoardMember, BoardMemberInput } from '$lib/board-history';

	let {
		member,
		onclose,
		onsaved
	}: {
		member: BoardMember | null;
		onclose: () => void;
		onsaved: () => void;
	} = $props();

	// The parent keys this editor by member ID so each edit starts with a fresh draft.
	const initial = untrack(() => member);
	let name = $state(initial?.name ?? '');
	let category = $state<BoardMemberInput['category']>(initial?.category ?? 'current');
	let start = $state(initial?.membership?.start ?? '');
	let end = $state(initial?.membership?.end ?? '');
	let roles = $state(
		(initial?.roles ?? []).map((role) => ({
			key: crypto.randomUUID(),
			title: role.title,
			start: role.period?.start ?? '',
			end: role.period?.end ?? ''
		}))
	);
	let busy = $state(false);
	let message = $state('');
	let confirmDelete = $state(false);
	const inputClass =
		'border-primary bg-background text-foreground-primary w-full rounded-md border px-3 py-2 text-sm';
	const buttonClass = 'border-primary rounded-md border px-3 py-2 text-sm disabled:opacity-50';
	const draft = $derived({
		name,
		category,
		membership:
			start || end ? { start: start.trim() || undefined, end: end.trim() || undefined } : undefined,
		roles: roles.map((role) => ({
			title: role.title,
			period:
				role.start || role.end
					? { start: role.start.trim() || undefined, end: role.end.trim() || undefined }
					: undefined
		}))
	});

	const submit: SubmitFunction = () => {
		busy = true;
		message = '';
		return async ({ result, update }) => {
			try {
				if (result.type === 'success') {
					await update({ reset: false });
					onsaved();
				} else if (result.type === 'failure') {
					message = String(result.data?.message ?? 'Kunne ikke lagre. Prøv igjen.');
				} else {
					message =
						'Kunne ikke lagre. Kontroller at du er innlogget som styremedlem, og prøv igjen.';
				}
			} catch {
				message =
					'Kunne ikke oppdatere siden. Last siden på nytt for å kontrollere om endringen ble lagret.';
			} finally {
				busy = false;
			}
		};
	};
</script>

<section
	class="border-primary space-y-4 rounded-lg border p-4"
	aria-label={member ? `Rediger ${member.name}` : 'Legg til medlem'}
>
	<h2 class="text-lg font-semibold">{member ? 'Rediger medlem' : 'Legg til medlem'}</h2>
	<p class="text-foreground-muted text-sm">
		La ukjente semestre stå tomme. Bruk «Høst 2025» eller «Vår 2026». Endringene blir synlige for
		alle når du lagrer.
	</p>
	{#if message}<p role="alert" class="text-red-500">{message}</p>{/if}
	<form method="POST" action="?/save" use:enhance={submit}>
		<input type="hidden" name="id" value={member?.id ?? ''} />
		<input type="hidden" name="revision" value={member?.revision ?? ''} />
		<input type="hidden" name="member" value={JSON.stringify(draft)} />
		<fieldset disabled={busy} class="space-y-4">
			<label class="block space-y-1"
				><span class="text-sm">Navn</span><input
					class={inputClass}
					bind:value={name}
					required
					maxlength="150"
				/></label
			>
			<label class="block space-y-1"
				><span class="text-sm">Vis under</span>
				<select class={inputClass} bind:value={category}>
					<option value="current">Nåværende styremedlemmer</option>
					<option value="past">Tidligere styremedlemmer</option>
					<option value="founder">Grunnleggere</option>
				</select>
			</label>
			<fieldset class="space-y-2">
				<legend class="mb-2 text-sm font-medium">Medlemsperiode i styret</legend>
				<div class="grid gap-3 sm:grid-cols-2">
					<label class="block space-y-1"
						><span class="text-sm">Fra semester</span><input
							class={inputClass}
							bind:value={start}
							placeholder="Høst 2025"
							maxlength="9"
						/></label
					>
					<label class="block space-y-1"
						><span class="text-sm">Til og med semester</span><input
							class={inputClass}
							bind:value={end}
							placeholder="Vår 2026"
							maxlength="9"
						/></label
					>
				</div>
			</fieldset>
			<div class="space-y-3">
				<h3 class="font-medium">Verv og perioder</h3>
				<p class="text-foreground-muted text-xs">
					Registrer en periode på hvert verv for å vise det i riktig styreår. Du kan legge til flere
					verv, også med overlappende perioder.
				</p>
				{#each roles as role, index (role.key)}
					<fieldset class="border-primary space-y-3 rounded-md border p-3">
						<legend class="px-1 text-sm">Verv {index + 1}</legend>
						<label class="block space-y-1"
							><span class="text-sm">Verv</span><input
								class={inputClass}
								bind:value={role.title}
								required
								maxlength="150"
							/></label
						>
						<div class="grid gap-3 sm:grid-cols-2">
							<label class="block space-y-1"
								><span class="text-sm">Fra semester</span><input
									class={inputClass}
									bind:value={role.start}
									placeholder="Høst 2025"
									maxlength="9"
								/></label
							>
							<label class="block space-y-1"
								><span class="text-sm">Til og med semester</span><input
									class={inputClass}
									bind:value={role.end}
									placeholder="Vår 2026"
									maxlength="9"
								/></label
							>
						</div>
						<button
							type="button"
							class={buttonClass}
							onclick={() => (roles = roles.filter((item) => item.key !== role.key))}
							>Fjern verv</button
						>
					</fieldset>
				{/each}
				<button
					type="button"
					class={buttonClass}
					disabled={roles.length >= 30}
					onclick={() =>
						(roles = [...roles, { key: crypto.randomUUID(), title: '', start: '', end: '' }])}
					>Legg til verv</button
				>
			</div>
			<div class="flex flex-wrap gap-2">
				<button
					type="submit"
					class="bg-primary text-background rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
					>{busy ? 'Lagrer …' : 'Lagre'}</button
				>
				<button type="button" class={buttonClass} onclick={onclose}>Avbryt</button>
			</div>
		</fieldset>
	</form>
	{#if member}
		{#if confirmDelete}
			<form method="POST" action="?/delete" use:enhance={submit} class="space-y-2">
				<input type="hidden" name="id" value={member.id} />
				<input type="hidden" name="revision" value={member.revision} />
				<p class="text-sm">Vil du slette {member.name} og alle vervene deres fra historikken?</p>
				<div class="flex gap-2">
					<button class={buttonClass} disabled={busy}>Ja, slett oppføringen</button>
					<button
						type="button"
						class={buttonClass}
						disabled={busy}
						onclick={() => (confirmDelete = false)}>Behold</button
					>
				</div>
			</form>
		{:else}
			<button
				type="button"
				class="text-sm text-red-500 underline"
				disabled={busy}
				onclick={() => (confirmDelete = true)}>Slett oppføringen</button
			>
		{/if}
	{/if}
</section>

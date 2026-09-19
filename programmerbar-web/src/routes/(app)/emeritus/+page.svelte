<script lang="ts">
	import SEO from '$lib/components/SEO.svelte';
	import { onMount } from 'svelte';
	import CLIWindow from '$lib/components/app/CLIWindow.svelte';
	import BoardMemberEditor from '$lib/components/app/BoardMemberEditor.svelte';
	import {
		formatPeriod,
		overlapsYear,
		getBoardYears,
		sortByFirstMembership,
		visibleRoles,
		type BoardMember as Member
	} from '$lib/board-history';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const groupLogo = '/android-chrome-192x192.png';
	const groupName = 'Programmerbar';
	const estYear = '2020';
	const description = 'Tidligere og nåværende medlemmer av echo Programmerbar';
	const sortedMembers = $derived(sortByFirstMembership(data.boardMembers));
	const coFounders = $derived(sortedMembers.filter((member) => member.category === 'founder'));
	const members = $derived(sortedMembers.filter((member) => member.category === 'current'));
	const pastMembers = $derived(sortedMembers.filter((member) => member.category === 'past'));
	const allMembers = $derived(sortedMembers.filter((member) => member.category !== 'founder'));
	type DisplayOptions = { roles: boolean; periods: boolean; history: boolean };
	let currentDisplay = $state<DisplayOptions>({ roles: true, periods: false, history: false });
	let pastDisplay = $state<DisplayOptions>({ roles: true, periods: true, history: true });
	let yearDisplay = $state<DisplayOptions>({ roles: true, periods: true, history: true });
	const boardYears = $derived(getBoardYears(allMembers));
	let selectedYear = $state('all');
	let ready = $state(false);
	onMount(() => {
		ready = true;
	});
	let editing = $state<Member | null>(null);
	let adding = $state(false);
	let saved = $state(false);
	function closeEditor() {
		editing = null;
		adding = false;
	}
	function editMember(member: Member) {
		editing = member;
		adding = false;
		saved = false;
	}
	const filteredMembers = $derived(
		allMembers.filter(
			(member) =>
				overlapsYear(member.membership, Number(selectedYear), member.category === 'current') ||
				member.roles.some((role) =>
					overlapsYear(role.period, Number(selectedYear), member.category === 'current')
				)
		)
	);
</script>

{#snippet checkboxMark(checked: boolean)}
	<span
		aria-hidden="true"
		class="flex size-4 shrink-0 items-center justify-center rounded border transition-colors motion-reduce:transition-none {checked
			? 'border-primary bg-primary text-background'
			: 'border-foreground-muted/50 bg-background'}"
	>
		<svg viewBox="0 0 16 16" fill="none" class="size-3 {checked ? 'opacity-100' : 'opacity-0'}">
			<path
				d="m3 8 3 3 7-7"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</span>
{/snippet}

{#snippet displayControls(options: DisplayOptions, label: string, allowHistory = false)}
	{@const choiceClass =
		'border-foreground-muted/25 bg-background text-foreground-secondary hover:border-primary/60 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-foreground-primary has-[:focus-visible]:ring-primary has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-40 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors motion-reduce:transition-none'}
	<fieldset disabled={!ready} class="mb-5 flex flex-wrap gap-2">
		<legend class="text-foreground-muted mb-2 text-xs"
			>Vis informasjon<span class="sr-only">: {label}</span></legend
		>
		<label class={choiceClass}>
			<input type="checkbox" bind:checked={options.roles} class="sr-only" />
			{@render checkboxMark(options.roles)}
			Vis verv
		</label>
		<label class={choiceClass}>
			<input type="checkbox" bind:checked={options.periods} class="sr-only" />
			{@render checkboxMark(options.periods)}
			Vis perioder
		</label>
		{#if allowHistory}
			<label class={choiceClass}
				><input
					type="checkbox"
					bind:checked={options.history}
					disabled={!options.roles}
					class="sr-only"
				/>
				{@render checkboxMark(options.history)}
				Vis alle verv
			</label>
		{/if}
	</fieldset>
{/snippet}

{#snippet memberList(list: Member[], options: DisplayOptions)}
	<ul class="space-y-4">
		{#each list as member (member.id)}
			{@const current = member.category === 'current'}
			{@const roles = visibleRoles(member, selectedYear, options.history)}
			{@const membershipPeriod = formatPeriod(
				member.membership?.start,
				member.membership?.end,
				current
			)}
			<li class="border-primary border-l-4 pl-4">
				{#if data.canEdit}
					<button
						type="button"
						disabled={!ready}
						class="text-foreground-muted hover:text-foreground-primary float-right ml-2 text-xs underline"
						onclick={() => editMember(member)}
						>Rediger<span class="sr-only"> {member.name}</span></button
					>
				{/if}
				<span class="block">{member.name}</span>
				{#if options.periods && membershipPeriod}
					<span class="text-foreground-muted mt-0.5 block text-xs"
						>I styret: {membershipPeriod}</span
					>
				{/if}
				{#if options.roles && roles.length}
					<ul class="mt-1 space-y-2">
						{#each roles as entry (entry)}
							{@const period = formatPeriod(entry.period?.start, entry.period?.end, current)}
							<li>
								<span class="text-foreground-secondary block text-sm">{entry.title}</span>
								{#if options.periods && period}
									<span class="text-foreground-muted mt-0.5 block text-xs">{period}</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
				{#if data.canEdit && editing?.id === member.id}
					<div class="mt-4">
						{#key editing.id}
							<BoardMemberEditor
								member={editing}
								onclose={closeEditor}
								onsaved={() => {
									closeEditor();
									saved = true;
								}}
							/>
						{/key}
					</div>
				{/if}
			</li>
		{/each}
	</ul>
{/snippet}

<SEO
	title="Tidligere Styremedlemmer"
	description="Lær mer om tidligere og nåværende styremedlemmer i Programmerbar."
	keywords="styremedlemmer, tidligere styremedlemmer, programmerbar, studentbar, informatikk studenter"
	canonical="/emeritus"
	type="website"
/>

<CLIWindow title="cat emeritus.txt" class="mx-auto max-w-xl">
	<!-- Window Content -->
	<div class="p-6 md:p-8">
		<div class="mx-auto max-w-xl space-y-8 text-center">
			<div>
				<img class="mx-auto h-32 w-auto" src={groupLogo} alt="Programmerbar logo" />
				<h1 class="text-foreground-primary mt-4 text-2xl font-semibold md:text-3xl">{groupName}</h1>
				<p class="text-foreground-muted mt-1 text-xs">
					<span class="text-foreground-subtle">#</span> EST. {estYear}
				</p>
				<p class="text-foreground-secondary mt-2 text-sm">{description}</p>
			</div>

			<div class="space-y-8 text-left">
				{#if data.canEdit}
					<div class="space-y-3">
						<button
							type="button"
							disabled={!ready}
							class="border-primary rounded-md border px-3 py-2 text-sm"
							onclick={() => {
								adding = true;
								editing = null;
								saved = false;
							}}>Legg til medlem</button
						>
						<p class="text-foreground-muted text-xs">
							Du er innlogget som styremedlem og kan redigere historikken her.
						</p>
						{#if saved}<p role="status" class="text-sm">Endringen er lagret.</p>{/if}
					</div>
					{#if adding}
						<BoardMemberEditor
							member={null}
							onclose={closeEditor}
							onsaved={() => {
								closeEditor();
								saved = true;
							}}
						/>
					{/if}
				{/if}
				<div>
					<label for="board-year" class="text-foreground-primary mb-2 block text-sm font-medium"
						>Vis styre</label
					>
					<select
						id="board-year"
						disabled={!ready}
						bind:value={selectedYear}
						class="border-primary bg-background text-foreground-primary focus:ring-primary w-full rounded-md border px-3 py-2 text-sm focus:ring-2"
						aria-describedby="board-history-note"
					>
						<option value="all">Hele listen</option>
						{#each boardYears as year (year)}
							<option value={String(year)}>Høst {year} – vår {year + 1}</option>
						{/each}
					</select>
					<p id="board-history-note" class="text-foreground-muted mt-3 text-sm">
						Listen er sortert etter første registrerte startsemester, eldste først. Ukjent start
						vises øverst. Historikken er ikke komplett. Flere kan ha sittet i styret i de ulike
						semestrene uten å være lagt til her ennå.
						{#if selectedYear !== 'all'}
							Utvalget viser medlemmer med registrert periode i dette styreåret. Medlemmer uten
							kjent periode finner du i hele listen.
						{/if}
					</p>
				</div>
				{#if selectedYear === 'all'}
					<!-- Co-founders -->
					<div>
						<h2 class="text-foreground-primary mb-4 text-lg font-semibold">
							<span class="text-foreground-muted">##</span> Co-founders
						</h2>
						{@render memberList(coFounders, { roles: true, periods: false, history: true })}
					</div>

					<div>
						<h2 class="text-foreground-primary mb-4 text-lg font-semibold">
							<span class="text-foreground-muted">##</span> Styremedlemmer
						</h2>
						{@render displayControls(currentDisplay, 'Visning av nåværende medlemmer', true)}
						{@render memberList(members, currentDisplay)}
					</div>

					<div>
						<h2 class="text-foreground-primary mb-4 text-lg font-semibold">
							<span class="text-foreground-muted">##</span> Tidligere Styremedlemmer
						</h2>
						{@render displayControls(pastDisplay, 'Visning av tidligere medlemmer')}
						{@render memberList(pastMembers, pastDisplay)}
					</div>
				{:else}
					<div aria-live="polite">
						<h2 class="text-foreground-primary mb-2 text-lg font-semibold">
							<span class="text-foreground-muted">##</span> Høst {selectedYear} – vår {Number(
								selectedYear
							) + 1}
						</h2>
						<p class="text-foreground-muted mb-4 text-sm">
							{filteredMembers.length} registrerte medlemmer i løpet av styreåret
						</p>
						{#if filteredMembers.length}
							{@render displayControls(yearDisplay, 'Visning av valgt styreår')}
							{@render memberList(filteredMembers, yearDisplay)}
						{:else}
							<p class="text-foreground-secondary text-sm">
								Ingen medlemmer er registrert med periode i dette styreåret ennå.
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</div>
	</div>
</CLIWindow>

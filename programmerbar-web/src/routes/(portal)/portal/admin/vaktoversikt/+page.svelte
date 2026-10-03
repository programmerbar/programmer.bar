<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { CalendarDays, ChevronUp, ChevronDown, ChevronsUpDown } from '@lucide/svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { normalDate } from '$lib/utils/date';
	let { data } = $props();
	let search = $state('');
	let role = $state('normal');
	type SortKey = 'name' | 'completed' | 'upcoming' | 'lastShift' | 'absences';
	let sortBy = $state<SortKey>('completed');
	let sortOrder = $state<'asc' | 'desc'>('asc');
	const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
		{ key: 'name', label: 'Navn' },
		{ key: 'completed', label: 'Fullført', numeric: true },
		{ key: 'upcoming', label: 'Kommende', numeric: true },
		{ key: 'lastShift', label: 'Siste vakt' },
		{ key: 'absences', label: 'Kan ikke stå' }
	];
	function handleSort(key: SortKey) {
		sortOrder = sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc';
		sortBy = key;
	}
	const filtered = $derived(
		data.users
			.filter(
				(user) =>
					(!role || user.role === role) &&
					user.name.toLocaleLowerCase('nb').includes(search.toLocaleLowerCase('nb'))
			)
			.toSorted((a, b) => {
				let comparison: number;
				if (sortBy === 'name') comparison = a.name.localeCompare(b.name, 'nb');
				else if (sortBy === 'lastShift')
					comparison = (a.lastShift?.getTime() ?? 0) - (b.lastShift?.getTime() ?? 0);
				else if (sortBy === 'absences') comparison = a.absences.length - b.absences.length;
				else comparison = a[sortBy] - b[sortBy];
				return (
					(sortOrder === 'asc' ? comparison : -comparison) || a.name.localeCompare(b.name, 'nb')
				);
			})
	);
</script>

<svelte:head><title>Vaktoversikt</title></svelte:head>
<section class="space-y-10">
	<div class="flex items-center gap-4">
		<CalendarDays class="h-6 w-6 shrink-0 text-gray-600 dark:text-gray-300" aria-hidden="true" />
		<div>
			<Heading level={1}>Vaktoversikt</Heading>
			<p class="mt-1 text-gray-600 dark:text-gray-300">
				Se fordelingen av vakter og hvem som kan stå.
			</p>
		</div>
	</div>
	<div class="bg-portal-card border-portal-border overflow-hidden rounded-lg border">
		<div
			class="border-portal-border flex flex-col gap-4 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div>
				<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
					{data.semester.label}
				</h2>
				<p class="text-sm text-gray-600 dark:text-gray-300">
					Viser {filtered.length} av {data.users.length} personer
				</p>
			</div>
			<form method="get" class="flex flex-wrap items-end gap-3">
				<label
					class="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-200"
					>Semester
					<select
						name="semester"
						value={data.semester.id}
						class="border-portal-border dark:bg-portal-hover rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:text-gray-100"
					>
						{#each data.semesters as semester (semester.id)}<option value={semester.id}
								>{semester.label}</option
							>{/each}
					</select>
				</label>
				<Button type="submit" size="sm">Vis semester</Button>
			</form>
		</div>
		<div class="border-portal-border grid gap-4 border-b px-6 py-4 sm:grid-cols-2">
			<label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-200"
				>Søk etter navn
				<Input type="search" bind:value={search} placeholder="Søk etter frivillig" class="w-full" />
			</label>
			<label class="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-200"
				>Vis
				<select
					bind:value={role}
					class="border-portal-border dark:bg-portal-hover h-10 rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:text-gray-100"
				>
					<option value="normal">Frivillige</option><option value="board">Styret</option><option
						value="inactive">Inaktive</option
					><option value="">Alle</option>
				</select>
			</label>
		</div>
		<div class="overflow-x-auto">
			<table class="divide-portal-border w-full min-w-180 divide-y text-left">
				<caption class="sr-only">Vaktfordeling for {data.semester.label}</caption>
				<thead class="dark:bg-portal-hover bg-gray-50">
					<tr
						class="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
					>
						{#each columns as column (column.key)}
							<th
								scope="col"
								class="px-6 py-3"
								aria-sort={sortBy === column.key
									? sortOrder === 'asc'
										? 'ascending'
										: 'descending'
									: 'none'}
							>
								<button
									type="button"
									onclick={() => handleSort(column.key)}
									class="flex cursor-pointer items-center gap-2 text-xs font-semibold tracking-wide uppercase transition-colors hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-offset-4 dark:hover:text-gray-200"
									class:ml-auto={column.numeric}
								>
									{column.label}
									{#if sortBy !== column.key}<ChevronsUpDown class="size-3" aria-hidden="true" />
									{:else if sortOrder === 'asc'}<ChevronUp class="size-3" aria-hidden="true" />
									{:else}<ChevronDown class="size-3" aria-hidden="true" />{/if}
								</button>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-portal-border divide-y text-sm text-gray-700 dark:text-gray-300">
					{#each filtered as user (user.id)}
						<tr class="hover:bg-portal-hover align-top transition-colors">
							<th scope="row" class="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
								{user.name}
								{#if user.role !== 'normal'}<span
										class="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400"
										>{user.role === 'board' ? 'Styret' : 'Inaktiv'}</span
									>{/if}
							</th>
							<td class="px-6 py-4 text-right font-medium tabular-nums">{user.completed}</td>
							<td class="px-6 py-4 text-right tabular-nums">{user.upcoming}</td>
							<td class="px-6 py-4 whitespace-nowrap"
								>{user.lastShift ? normalDate(user.lastShift) : 'Ingen'}</td
							>
							<td class="px-6 py-4">
								{#if user.absences.length}
									<details>
										<summary
											class="cursor-pointer font-medium whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400"
											>{user.absences.length}
											{user.absences.length === 1 ? 'periode' : 'perioder'}</summary
										>
										<ul class="mt-2 space-y-2 text-xs text-gray-500 dark:text-gray-400">
											{#each user.absences as absence (absence.id)}<li>
													{normalDate(absence.startAt)} – {normalDate(absence.endAt)}
												</li>{/each}
										</ul>
									</details>
								{:else}<span class="text-gray-500 dark:text-gray-400">Ingen</span>{/if}
							</td>
						</tr>
					{:else}
						<tr
							><td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
								>Ingen frivillige som passer søket. Prøv et annet navn eller endre filtrene.</td
							></tr
						>
					{/each}
				</tbody>
			</table>
		</div>
		<details
			class="border-portal-border border-t px-6 py-4 text-sm text-gray-500 dark:text-gray-400"
		>
			<summary class="cursor-pointer font-medium">Slik telles vaktene</summary>
			<p class="mt-2 max-w-2xl">
				Vårsemesteret er januar–juni, og høstsemesteret er juli–desember. Vaktens start avgjør
				semesteret. Fullførte vakter er aksepterte vakter med passert sluttid; oppmøte registreres
				ikke separat. Kommende inkluderer pågående vakter.
			</p>
		</details>
	</div>
</section>

<script lang="ts">
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import { RotateCcwClock, ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { SvelteSet, SvelteURLSearchParams } from 'svelte/reactivity';

	const formatter = new Intl.DateTimeFormat('no-NO', {
		dateStyle: 'short',
		timeStyle: 'short'
	});

	let { data } = $props();

	function formatTimestamp(value: Date | string | number) {
		const date = value instanceof Date ? value : new Date(value);
		return formatter.format(date);
	}

	function buildQuery(params: Record<string, string | number | null | undefined>) {
		const search = new SvelteURLSearchParams();

		if (data.filters?.startDate) {
			search.set('startDate', data.filters.startDate);
		}

		if (data.filters?.endDate) {
			search.set('endDate', data.filters.endDate);
		}

		for (const [key, value] of Object.entries(params)) {
			if (value === null || value === undefined || value === '') continue;
			search.set(key, String(value));
		}

		const query = search.toString();
		return query ? `?${query}` : '';
	}

	function buildDownloadUrl() {
		const search = new SvelteURLSearchParams();

		if (data.filters?.startDate) {
			search.set('startDate', data.filters.startDate);
		}

		if (data.filters?.endDate) {
			search.set('endDate', data.filters.endDate);
		}

		const query = search.toString();
		return `/portal/admin/historikk/download.csv${query ? `?${query}` : ''}`;
	}

	type PaginationItem = { type: 'page'; value: number } | { type: 'ellipsis'; key: string };

	const paginationItems = $derived.by(() => {
		const { currentPage, pageCount } = data.pagination;
		if (pageCount <= 0) {
			return [];
		}

		const pages = new SvelteSet<number>();

		pages.add(1);
		if (pageCount > 1) {
			pages.add(pageCount);
		}
		if (pageCount > 2) {
			pages.add(pageCount - 1);
		}

		for (let offset = -2; offset <= 2; offset += 1) {
			const candidate = currentPage + offset;
			if (candidate > 1 && candidate < pageCount) {
				pages.add(candidate);
			}
		}

		const sortedPages = Array.from(pages)
			.filter((page) => page >= 1 && page <= pageCount)
			.sort((a, b) => a - b);

		const items: Array<PaginationItem> = [];

		for (let index = 0; index < sortedPages.length; index += 1) {
			const page = sortedPages[index];
			const previous = sortedPages[index - 1];

			if (index > 0 && page - previous > 1) {
				items.push({ type: 'ellipsis', key: `ellipsis-${previous}-${page}` });
			}

			items.push({ type: 'page', value: page });
		}

		return items;
	});

	const previousPage = $derived.by(() =>
		data.pagination.currentPage > 1 ? data.pagination.currentPage - 1 : null
	);

	const nextPage = $derived.by(() =>
		data.pagination.currentPage < data.pagination.pageCount ? data.pagination.currentPage + 1 : null
	);

	const hasFilters = $derived.by(() => Boolean(data.filters?.startDate || data.filters?.endDate));
</script>

<svelte:head>
	<title>Admin - Bonghistorikk</title>
</svelte:head>

<div class="space-y-10">
	<!-- Header with back button -->
	<div class="flex items-center gap-4">
		<RotateCcwClock class="h-6 w-6 text-gray-600 dark:text-gray-300" />
		<div>
			<Heading>Bonghistorikk</Heading>
			<p class="mt-1 text-gray-600 dark:text-gray-300">Se historikk for bruk av bong</p>
		</div>
	</div>

	<div class="bg-portal-card border-portal-border rounded-lg border">
		<div class="border-portal-border border-b px-6 py-4">
			<h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Claimede bonger</h2>
			<p class="text-sm text-gray-600 dark:text-gray-300">Viser de siste claimene først.</p>
		</div>
		<div
			class="border-portal-border flex flex-col gap-4 border-b px-6 py-4 lg:flex-row lg:items-end lg:justify-between"
		>
			<form
				method="get"
				class="grid w-full gap-4 sm:grid-cols-2 lg:flex lg:flex-1 lg:flex-wrap lg:items-end"
			>
				<div class="flex flex-col gap-2">
					<label for="startDate" class="text-sm font-medium text-gray-700 dark:text-gray-200"
						>Fra</label
					>
					<input
						id="startDate"
						type="datetime-local"
						name="startDate"
						value={data.filters?.startDate ?? ''}
						class="dark:focus:border-primary dark:focus:ring-primary/20 border-portal-border dark:bg-portal-hover w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:text-gray-100"
					/>
				</div>
				<div class="flex flex-col gap-2">
					<label for="endDate" class="text-sm font-medium text-gray-700 dark:text-gray-200"
						>Til</label
					>
					<input
						id="endDate"
						type="datetime-local"
						name="endDate"
						value={data.filters?.endDate ?? ''}
						class="dark:focus:border-primary dark:focus:ring-primary/20 border-portal-border dark:bg-portal-hover w-full rounded-md border px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none dark:text-gray-100"
					/>
				</div>
				<input type="hidden" name="page" value="1" />
				<div class="flex items-center gap-3 sm:col-span-2 lg:ml-auto">
					<Button type="submit" size="sm">Filtrer</Button>
					{#if hasFilters}
						<ButtonLink href="/portal/admin/historikk" intent="outline" size="sm">
							Nullstill
						</ButtonLink>
					{/if}
				</div>
			</form>
			<ButtonLink
				href={buildDownloadUrl()}
				intent="outline"
				class="w-full justify-center gap-2 lg:w-auto"
				size="sm"
			>
				Last ned CSV
			</ButtonLink>
		</div>
		{#if data.claimedCredits.length === 0}
			<div class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
				Det er ingen registrerte claim i databasen ennå.
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="divide-portal-border w-full min-w-180 divide-y">
					<thead class="dark:bg-portal-hover bg-gray-50">
						<tr
							class="text-xs font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400"
						>
							<th class="px-6 py-3 text-left">Dato</th>
							<th class="px-6 py-3 text-left">Bruker</th>
							<th class="px-6 py-3 text-left">Produkt-ID</th>
							<th class="px-6 py-3 text-right">Credits</th>
						</tr>
					</thead>
					<tbody class="divide-portal-border divide-y text-sm text-gray-700 dark:text-gray-300">
						{#each data.claimedCredits as entry (entry.id)}
							<tr class="hover:bg-portal-hover transition-colors">
								<td class="px-6 py-4 whitespace-nowrap">
									{formatTimestamp(entry.createdAt)}
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									{entry.user?.name ?? 'Ukjent bruker'}
								</td>
								<td
									class="px-6 py-4 font-mono text-xs whitespace-nowrap text-gray-500 dark:text-gray-400"
								>
									{entry.productId}
								</td>
								<td class="px-6 py-4 text-right whitespace-nowrap text-gray-900 dark:text-gray-100">
									{entry.creditCost}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="border-portal-border flex justify-center border-t px-6 py-4">
				<nav aria-label="Paginering" class="flex items-center gap-2">
					{#if previousPage}
						<ButtonLink
							href={buildQuery({ page: previousPage })}
							intent="outline"
							size="sm"
							class="gap-1"
							data-sveltekit-noscroll
						>
							<ChevronLeft class="h-4 w-4" />
							Forrige
						</ButtonLink>
					{:else}
						<span
							class="border-portal-border dark:bg-portal-hover flex items-center gap-1 rounded-lg border border-dashed bg-gray-50 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500"
						>
							<ChevronLeft class="h-4 w-4" />
							Forrige
						</span>
					{/if}

					{#each paginationItems as item (item.type === 'page' ? item.value : item.key)}
						{#if item.type === 'ellipsis'}
							<span class="px-2 text-sm text-gray-400 dark:text-gray-500">…</span>
						{:else if item.value === data.pagination.currentPage}
							<span
								class="border-primary-dark bg-primary dark:border-primary-dark dark:bg-primary rounded-lg border px-3 py-1.5 text-sm font-medium text-white"
							>
								{item.value}
							</span>
						{:else}
							<ButtonLink
								href={buildQuery({ page: item.value })}
								intent="outline"
								size="sm"
								data-sveltekit-noscroll
							>
								{item.value}
							</ButtonLink>
						{/if}
					{/each}

					{#if nextPage}
						<ButtonLink
							href={buildQuery({ page: nextPage })}
							intent="outline"
							size="sm"
							class="gap-1"
							data-sveltekit-noscroll
						>
							Neste
							<ChevronRight class="h-4 w-4" />
						</ButtonLink>
					{:else}
						<span
							class="border-portal-border dark:bg-portal-hover flex items-center gap-1 rounded-lg border border-dashed bg-gray-50 px-3 py-1.5 text-sm text-gray-400 dark:text-gray-500"
						>
							Neste
							<ChevronRight class="h-4 w-4" />
						</span>
					{/if}
				</nav>
			</div>
		{/if}
	</div>
</div>

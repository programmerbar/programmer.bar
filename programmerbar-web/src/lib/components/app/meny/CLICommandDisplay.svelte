<script lang="ts">
	import type { FilterState } from '$lib/states/filter-state.svelte';
	import { SORT_OPTIONS } from '$lib/states/filter-state.svelte';

	type Props = {
		filter: FilterState;
		priceRange: { min: number; max: number };
		inline?: boolean;
	};

	let { filter, priceRange, inline = false }: Props = $props();

	const command = $derived.by(() => {
		const parts: string[] = [];
		const MAX_ITEMS = 2; // Max items to show before truncating

		if (filter.current.search.trim()) {
			parts.push(`fzf -e '${filter.current.search.trim()}'`);
		} else {
			parts.push('cat produkter.txt');
		}

		const grepParts: string[] = [];

		if (filter.current.types.size > 0) {
			const types = Array.from(filter.current.types);
			if (types.length > MAX_ITEMS) {
				grepParts.push(`type[${types.length} selected]`);
			} else {
				grepParts.push(`type[${types.join(',')}]`);
			}
		}

		if (filter.current.breweries.size > 0) {
			const breweries = Array.from(filter.current.breweries).map((b) =>
				b === '__no_brewery__' ? 'Uten bryggeri' : b
			);
			if (breweries.length > MAX_ITEMS) {
				grepParts.push(`bryggeri[${breweries.length} selected]`);
			} else {
				grepParts.push(`bryggeri[${breweries.join(',')}]`);
			}
		}

		if (grepParts.length > 0) {
			parts.push(`grep ${grepParts.join(' ')}`);
		}

		const isPriceFiltered =
			filter.current.priceRange.min !== priceRange.min ||
			filter.current.priceRange.max !== priceRange.max;

		if (isPriceFiltered) {
			const priceType = filter.current.showStudentPrice ? 'student' : 'ordinary';
			parts.push(
				`awk '${priceType}>=${filter.current.priceRange.min} && ${priceType}<=${filter.current.priceRange.max}'`
			);
		}

		if (!filter.current.hideSoldOut) {
			parts.push(`grep -v 'in_stock'`);
		}

		if (filter.current.sort !== 'name-asc') {
			const sortOption = SORT_OPTIONS.find((opt) => opt.value === filter.current.sort);
			if (sortOption) {
				const field = filter.current.sort.split('-')[0];
				const direction = filter.current.sort.split('-')[1];
				const directionLabel = direction === 'asc' ? 'low-high' : 'high-low';
				parts.push(`sort ${field}[${directionLabel}]`);
			}
		}

		return `$ ${parts.join(' | ')}`;
	});
</script>

{#if inline}
	<code class="text-foreground-muted font-mono text-xs break-all">{command}</code>
{:else}
	<div class="border-border bg-card-muted overflow-x-auto border-t px-3 py-2 font-mono text-xs">
		<code class="text-foreground-secondary break-all">{command}</code>
	</div>
{/if}

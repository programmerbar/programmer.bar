<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { extractTypes } from '$lib/utils/products';
	import { FilterState, SORT_OPTIONS } from '$lib/states/filter-state.svelte';
	import CLIMultipleSelect from './CLIMultipleSelect.svelte';
	import CLISelect from './CLISelect.svelte';
	import CLIPriceRangeSlider from './CLIPriceRangeSlider.svelte';
	import CLICommandDisplay from './CLICommandDisplay.svelte';

	type Props = {
		filter: FilterState;
		types: ReturnType<typeof extractTypes>;
		breweries: Array<string>;
		priceRange: { min: number; max: number };
		alwaysFilteredByCredits?: boolean;
		disableSticky?: boolean;
	};

	let {
		filter = $bindable(),
		types,
		breweries,
		priceRange,
		alwaysFilteredByCredits = false,
		disableSticky = false
	}: Props = $props();

	const typeOptions = $derived(types.map((type) => ({ id: type._id, label: type.title })));

	function updatePriceRange(newRange: { min: number; max: number }) {
		filter.current.priceRange = newRange;
	}
</script>

<div
	class={cn(
		'border-border bg-card flex h-fit w-full flex-col border-2 font-mono md:max-w-[300px]',
		{
			'md:sticky md:top-5': !disableSticky
		}
	)}
>
	<!-- Window Title Bar -->
	<div class="border-border bg-card-muted flex items-center border-b px-3 py-1.5">
		<div class="flex items-center gap-2">
			<div class="flex gap-1.5">
				<div class="bg-accent-error h-3 w-3 rounded-full"></div>
				<div class="bg-accent-warning h-3 w-3 rounded-full"></div>
				<div class="bg-accent-success h-3 w-3 rounded-full"></div>
			</div>
			<h2 class="text-foreground-secondary ml-2 text-xs font-medium">
				<span class="text-foreground-muted">$</span>
				<span class="ml-1">filter</span>
			</h2>
		</div>
	</div>
	<!-- Window Content -->
	<div class="flex flex-col gap-2 p-4">
		<div class="flex flex-col gap-1">
			<label for="search" class="text-foreground-secondary text-xs font-medium">Søk</label>
			<input
				type="text"
				id="search"
				placeholder="Søk etter produkt"
				class="border-border bg-card-muted focus:border-primary border px-2 py-1.5 text-sm focus:ring-0 focus:outline-none"
				bind:value={filter.current.search}
			/>
		</div>

		<CLISelect
			id="sort"
			label="Sorter etter"
			bind:value={filter.current.sort}
			options={SORT_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
		/>

		<CLIMultipleSelect
			options={typeOptions}
			selected={Array.from(filter.current.types)}
			onToggle={(type) => filter.toggleType(type)}
			placeholder="Alle typer"
			label="Type"
		/>

		<CLIMultipleSelect
			options={breweries.map((brewery) =>
				brewery === '__no_brewery__'
					? { id: '__no_brewery__', label: 'Uten bryggeri' }
					: { id: brewery, label: brewery }
			)}
			selected={Array.from(filter.current.breweries)}
			onToggle={(brewery) => filter.toggleBrewery(brewery)}
			placeholder="Alle bryggerier"
			label="Bryggeri"
		/>

		<CLIPriceRangeSlider
			min={priceRange.min}
			max={priceRange.max}
			value={filter.current.priceRange}
			onUpdate={updatePriceRange}
		/>

		{#if alwaysFilteredByCredits}{:else}
			<div class="flex items-center justify-between py-2">
				<label for="hideSoldOut" class="text-foreground-secondary text-xs font-medium"
					>Skjul utsolgt</label
				>
				<input
					type="checkbox"
					id="hideSoldOut"
					class="border-border h-4 w-4 border-2"
					bind:checked={filter.current.hideSoldOut}
				/>
			</div>

			<div class="flex items-center justify-between py-2">
				<label for="showStudentPrice" class="text-foreground-secondary text-xs font-medium"
					>Vis studentpris</label
				>
				<input
					type="checkbox"
					id="showStudentPrice"
					class="border-border h-4 w-4 border-2"
					bind:checked={filter.current.showStudentPrice}
				/>
			</div>
		{/if}

		<div class="pt-2">
			<button
				type="button"
				class="border-border bg-card-muted hover:bg-card-hover text-foreground-primary w-full border px-3 py-2 font-mono text-sm transition-colors"
				onclick={() => filter.reset(priceRange)}
			>
				$ reset filters
			</button>
		</div>
	</div>

	<!-- CLI Command Display -->
	<!-- <CLICommandDisplay {filter} {priceRange} /> -->
</div>

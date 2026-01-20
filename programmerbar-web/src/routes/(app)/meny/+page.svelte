<script lang="ts">
	import ProductPreview from '$lib/components/app/meny/ProductPreview.svelte';
	import ProductSidebar from '$lib/components/app/meny/ProductSidebar.svelte';
	import {
		filterProducts,
		extractBreweries,
		extractPriceRange,
		extractTypes
	} from '$lib/utils/products';
	import { FilterState } from '$lib/states/filter-state.svelte';
	import SEO from '$lib/components/SEO.svelte';

	let { data } = $props();

	const types = $derived(extractTypes(data.products));
	const breweries = $derived(extractBreweries(data.products));
	let filter = new FilterState();
	let priceRange = $derived(extractPriceRange(data.products, filter.current.showStudentPrice));
	let filteredProducts = $derived(filterProducts(data.products, filter));
</script>

<SEO
	title="Meny"
	description="Utforsk vår meny med øl, snacks, cider og andre drikker. Studentpriser tilgjengelig for alle produkter."
	keywords="meny, øl, cider, drikker, studentpriser, programmerbar, priser"
	canonical="/meny"
	type="website"
/>

<div class="flex w-full flex-col gap-8 sm:mx-auto sm:max-w-screen-sm md:max-w-full md:flex-row">
	<ProductSidebar {types} {breweries} {priceRange} {filter} />

	<div class="flex-1">
		{#if filteredProducts.length > 0}
			<div class="border-border mb-4 border-b pb-2 font-mono">
				<p class="text-foreground-muted mt-1 text-xs">
					Viser {filteredProducts.length} resultater
				</p>
			</div>

			<ul class="grid w-full grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
				{#each filteredProducts as product (product._id)}
					<li>
						<ProductPreview {product} {filter} />
					</li>
				{/each}
			</ul>
		{:else}
			<div
				class="border-border bg-card-muted flex flex-col items-center justify-center border-l-4 p-12 text-center font-mono"
			>
				<p class="text-foreground-muted mb-2">$ grep produkter.txt</p>
				<p class="text-foreground-secondary mb-4 text-sm">
					grep: produkter.txt: Finner ingen produkter som matcher søket ditt
				</p>
				<p class="text-foreground-muted mt-2 text-sm">
					Debug: Prøv å refaktorere søket ditt eller fjern noen filtre 🤓
				</p>
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import type { GET_PRODUCTS_QUERYResult } from '@programmerbar/cms/types';
	import { resolve } from '$app/paths';
	import { urlFor } from '$lib/api/sanity/queries';
	import CLIWindow from '$lib/components/app/CLIWindow.svelte';

	type Props = {
		products: GET_PRODUCTS_QUERYResult;
	};

	let { products }: Props = $props();

	const INTERVAL = 5000;
	const MANUAL_INTERVAL = 10000;
	const MAX = 6;
	const TOTAL_PAGES = Math.ceil(products.length / MAX);

	let currentPage = $state(0);
	let start = $derived(currentPage * MAX);
	let end = $derived(start + MAX);

	let delay = $state(INTERVAL);

	$effect(() => {
		const interval = setInterval(() => {
			currentPage = (currentPage + 1) % TOTAL_PAGES;
			delay = INTERVAL;
		}, delay);

		return () => clearInterval(interval);
	});

	function goToPage(index: number) {
		currentPage = (index + TOTAL_PAGES) % TOTAL_PAGES;

		delay = MANUAL_INTERVAL;
	}
</script>

<CLIWindow title="cat meny.txt">
	<!-- Window Content -->
	<div class="flex flex-1 flex-col p-6 md:p-8" aria-hidden="true">
		<ul class="flex flex-1 flex-col gap-4 overflow-hidden">
			{#each products.slice(start, end) as product (product._id)}
				{@const { _id, name, producer, priceList, image } = product}
				<li class="group">
					<a href={resolve('/(app)/produkt/[id]', { id: _id })} class="block">
						<div
							class="border-primary bg-card-muted hover:border-primary-dark hover:bg-card-hover relative border-l-4 p-4 font-mono transition-all duration-300"
						>
							<div class="flex items-center gap-4">
								{#if image}
									<div class="bg-card relative hidden h-16 w-16 shrink-0 overflow-hidden sm:block">
										<img
											src={urlFor(image).width(100).height(100).url()}
											alt={name}
											class="h-full w-full object-contain"
										/>
									</div>
								{:else}
									<div
										class="from-muted-light to-border-light hidden h-16 w-16 shrink-0 items-center justify-center bg-linear-to-br sm:flex"
									>
										<svg
											class="text-foreground-subtle h-8 w-8"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
											/>
										</svg>
									</div>
								{/if}

								<div class="min-w-0 flex-1">
									<h3
										class="text-foreground-primary group-hover:text-primary mb-1 line-clamp-2 text-base leading-tight font-medium transition-colors duration-200"
									>
										{name}
									</h3>
									<p class="text-foreground-muted line-clamp-1 text-sm">
										{producer}
									</p>
								</div>

								<div class="flex shrink-0 items-center gap-3">
									<div class="text-right">
										<p class="text-foreground-primary text-lg font-medium">
											{priceList.student === 0 ? 'Gratis' : `${priceList.student} kr`}
										</p>
									</div>
									<div class="text-foreground-muted">
										<span class="text-sm">></span>
									</div>
								</div>
							</div>
						</div>
					</a>
				</li>
			{/each}
			{#if TOTAL_PAGES > 1}
			<div class="h-6 border-border mt-auto flex items-center gap-1 ">
				<button
					onclick={() => (goToPage(currentPage - 1))}
					class="md:w-10 w-15 h-5 min-w-fit pt-0.5 pb-0.5 text-xs cursor-pointer pl-2 pr-2 transition-all duration-300
					 hover:bg-border-light rounded-full"
					aria-label="Forrige Side"
				>{"<<"}</button>
				<div class="flex w-fitt gap-1 w-1/1">
					{#each Array.from({ length: TOTAL_PAGES }, (_, i) => i) as i (i)}
						<button
							onclick={() => (goToPage(i))}
							class="m-auto text-center h-3 pt-0.5 pb-0.5 rounded-full cursor-pointer pl-2 pr-2 transition-all duration-300 
								{i === currentPage % TOTAL_PAGES
								? "bg-primary min-w-fit w-1/3 h-4"
								: 'bg-border-light min-w-fit w-1/5 hover:bg-border hover:h-3.5'}"
							aria-label="Side {i + 1}"
						></button>
					{/each}
				</div>
				<button
					onclick={() => (goToPage(currentPage + 1))}
					class="md:w-10 w-15 h-5 min-w-fit pt-0.5 pb-0.5 text-xs cursor-pointer pl-2 pr-2 transition-all duration-300
					hover:bg-border-light rounded-full"
					aria-label="Neste Side"
				>{">>"}</button>
			</div>
		{/if}
		</ul>
	</div>
</CLIWindow>

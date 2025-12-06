<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { urlFor } from '$lib/api/sanity/queries';
	import { cn } from '$lib/utils/cn';
	import ProductDetailsCard from '$lib/components/app/product/ProductDetailsCard.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { Image } from '@lucide/svelte';
	import { marked } from 'marked';
	import { toast } from 'svelte-sonner';
	import { onDestroy } from 'svelte';
	import ClaimConfirmationModal from './_components/ClaimConfirmationModal.svelte';
	import ClaimVerificationScreen from './_components/ClaimVerificationScreen.svelte';
	import CLIWindow from '$lib/components/app/CLIWindow.svelte';

	let { data } = $props();

	const html = marked(data.product.description ?? '');
	const isAuthenticated = $derived(page.data.user);
	const canClaimProduct = $derived.by(
		() => isAuthenticated && data.product.priceList.credits && data.product.priceList.credits > 0
	);

	const variants = data.product.variants?.map((variant) => variant) ?? [];

	const metadata = [
		{ title: 'Produsent', value: data.product.producer ?? 'Ingen' },
		{
			title: 'Alkoholinnhold',
			value: data.product.alcoholContent ? `${data.product.alcoholContent}%` : 'Ukjent'
		},
		{ title: 'Volum', value: data.product.volume ? `${data.product.volume} l` : 'Ukjent' },
		{
			title: 'Pris (Ordinær)',
			value:
				data.product.priceList.ordinary === 0 ? 'Gratis' : data.product.priceList.ordinary + ' NOK'
		},
		{
			title: 'Pris (Student)',
			value:
				data.product.priceList.student === 0 ? 'Gratis' : data.product.priceList.student + ' NOK'
		},
		...(data.product.priceList.credits && data.product.priceList.credits > 0
			? [{ title: 'Bong pris', value: data.product.priceList.credits }]
			: [])
	];

	type ClaimFeedback = {
		type: 'success' | 'error';
		message: string;
	};

	const creditCost = data.product.priceList.credits ?? 0;

	let claimLoading = $state(false);
	let claimFeedback = $state<ClaimFeedback | null>(null);
	let showConfirmation = $state(false);
	let showVerification = $state(false);
	let timerSeconds = $state(30);
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);
	let remainingCredits = $state<number | null>(null);
	let claimForm = $state<HTMLFormElement | null>(null);
	let imageLoaded = $state(false);

	// SEO data
	const productImage = data.product.image
		? urlFor(data.product.image).width(2000).quality(95).url()
		: undefined;
	const productDescription =
		data.product.description ||
		`${data.product.name} - ${data.product.producer || 'Ukjent produsent'} - Pris fra ${data.product.priceList.student} kr`;

	function openConfirmation() {
		claimFeedback = null;
		remainingCredits = null;
		showConfirmation = true;
	}

	function cancelConfirmation() {
		showConfirmation = false;
	}

	function submitClaimFromModal() {
		if (!claimForm) return;
		claimLoading = true;
		showConfirmation = false;
		claimForm.requestSubmit();
	}

	function startVerificationTimer() {
		timerSeconds = 30;
		if (timerInterval) {
			clearInterval(timerInterval);
		}
		timerInterval = setInterval(() => {
			timerSeconds -= 1;
			if (timerSeconds <= 0 && timerInterval) {
				clearInterval(timerInterval);
				timerInterval = null;
			}
		}, 1000);
	}

	function closeVerification() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
		showVerification = false;
		timerSeconds = 30;
	}

	onDestroy(() => {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	});
</script>

<SEO
	title={data.product.name}
	description={productDescription}
	keywords={`${data.product.name}, ${data.product.producer || ''}, øl, drikke, studentpris, programmerbar`}
	canonical={`/produkt/${data.product._id}`}
	image={productImage}
	type="product"
/>

<CLIWindow
	title="cat produkt/{data.product._id}.txt"
	class="mx-auto w-full max-w-6xl"
	onClose={() => window.history.back()}
>
	<!-- Window Content -->
	<div class="flex-1 p-6 md:p-8">
		<!-- Mobile Header - Only visible on mobile -->
		<div class="mb-6 lg:hidden">
			<h1 class="text-foreground-primary text-3xl font-bold">{data.product.name}</h1>
			{#if variants.length > 0}
				<p class="text-foreground-secondary mt-2 text-lg">
					{variants.join(' • ')}
				</p>
			{/if}
		</div>

		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Left Column: Image and Description -->
			<div class="space-y-6">
				<!-- Product Image with Description -->
				{#if data.product.image}
					<div class="bg-card overflow-hidden">
						<div class="bg-card-muted relative flex aspect-square items-center justify-center">
							<!-- Placeholder Icon -->
							{#if !imageLoaded}
								<div class="absolute inset-0 flex items-center justify-center">
									<Image class="text-foreground-muted h-16 w-16" />
								</div>
							{/if}

							<!-- Product Image -->
							<img
								class="h-full w-full object-contain {imageLoaded
									? 'opacity-100'
									: 'opacity-0'} transition-opacity duration-300"
								src={urlFor(data.product.image).width(1000).quality(90).url()}
								alt={data.product.name}
								onload={() => (imageLoaded = true)}
							/>
						</div>

						<!-- Description attached to image -->
						{#if html}
							<div class="bg-card py-6">
								<div class="markdown-content text-foreground-primary">{@html html}</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="bg-card-muted flex aspect-square items-center justify-center">
						<div class="text-center">
							<p class="text-foreground-muted mb-2 text-sm">$ cat image.jpg</p>
							<p class="text-accent-error text-sm font-semibold">
								cat: image.jpg: No such file or directory
							</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- Right Column: Product Details -->
			<div class="space-y-6">
				<!-- Desktop Header - Only visible on desktop -->
				<div class="hidden space-y-2 lg:block">
					<h1 class="text-foreground-primary text-4xl font-bold">{data.product.name}</h1>
					{#if variants.length > 0}
						<p class="text-foreground-secondary text-lg">
							{variants.join(' • ')}
						</p>
					{/if}
				</div>

				<!-- Pricing -->
				<div class="border-border bg-card-muted space-y-4 border-2 p-6">
					<div
						class={cn('grid grid-cols-1 gap-4', {
							'sm:grid-cols-3': canClaimProduct,
							'sm:grid-cols-2': !canClaimProduct
						})}
					>
						<div class="text-center">
							<p class="text-foreground-secondary text-sm font-medium">Ordinær pris</p>
							<p class="text-foreground-primary text-2xl font-bold">
								{data.product.priceList.ordinary === 0
									? 'Gratis'
									: `${data.product.priceList.ordinary} kr`}
							</p>
						</div>
						<div class="text-center">
							<p class="text-foreground-secondary text-sm font-medium">Student pris</p>
							<p class="text-primary text-2xl font-bold">
								{data.product.priceList.student === 0
									? 'Gratis'
									: `${data.product.priceList.student} kr`}
							</p>
						</div>
						{#if canClaimProduct}
							<div class="text-center">
								<p class="text-foreground-secondary text-sm font-medium">Bong pris</p>
								<p class="text-primary text-2xl font-bold">
									{#if data.product.priceList.credits === 0}
										Gratis
									{:else}
										{data.product.priceList.credits}
										{data.product.priceList.credits === 1 ? 'bong' : 'bonger'}
									{/if}
								</p>
							</div>
						{/if}
					</div>

					{#if canClaimProduct}
						<form
							bind:this={claimForm}
							method="post"
							action="?/claimProduct"
							use:enhance={() => {
								claimLoading = true;
								claimFeedback = null;

								return async ({ result }) => {
									claimLoading = false;

									const fallbackMessage = 'Det oppstod ein feil';
									const extractMessage = (payload: unknown) =>
										typeof payload === 'object' && payload && 'message' in payload
											? String((payload as { message?: unknown }).message ?? fallbackMessage)
											: fallbackMessage;

									if (result.type === 'success' && result.data) {
										const payload = result.data as {
											success?: boolean;
											message?: string;
											updatedBeerCount?: number;
										};

										if (payload.success) {
											const remaining =
												typeof payload.updatedBeerCount === 'number'
													? payload.updatedBeerCount
													: undefined;

											const baseMessage =
												payload.message ??
												`Produkt claimet for ${creditCost} ${creditCost === 1 ? 'bong' : 'bonger'}.`;

											const remainingMessage =
												remaining !== undefined
													? ` Du har ${remaining} ${remaining === 1 ? 'bong' : 'bonger'} igjen.`
													: '';

											toast.success(
												`${data.product.name} claimed!${remainingMessage ? ' ' + remainingMessage : ''}`
											);

											remainingCredits = remaining ?? null;
											showVerification = true;
											startVerificationTimer();

											claimFeedback = {
												type: 'success',
												message: `${baseMessage}${remainingMessage}`
											};

											return;
										}
									}

									const message =
										result.type === 'failure' ? extractMessage(result.data) : fallbackMessage;

									toast.error(message);
									claimFeedback = {
										type: 'error',
										message
									};
								};
							}}
							class="border-border bg-card flex flex-col gap-3 border-2 p-4"
						>
							<input type="hidden" name="productId" value={data.product._id} />
							<input type="hidden" name="productName" value={data.product.name} />
							<p class="text-foreground-primary text-sm font-medium">
								Du kan claime dette produktet for {creditCost}
								{creditCost === 1 ? 'bong' : 'bonger'}.
							</p>
							<button
								type="button"
								class="border-border bg-card-muted hover:bg-card-hover hover:border-primary text-foreground-primary w-full cursor-pointer border-2 px-6 py-3 text-center font-mono text-sm font-semibold whitespace-nowrap transition-all disabled:opacity-50"
								disabled={claimLoading}
								onclick={openConfirmation}
							>
								{claimLoading ? 'Laster...' : 'Claim produkt'}
							</button>
						</form>

						{#if claimFeedback}
							<div
								class="border-border bg-card-muted border-l-4 p-4 {claimFeedback.type === 'success'
									? 'border-accent-success'
									: 'border-accent-error'}"
							>
								<p
									class="text-sm font-semibold {claimFeedback.type === 'success'
										? 'text-accent-success'
										: 'text-accent-error'}"
								>
									{claimFeedback.type === 'success' ? 'success: ' : 'error: '}
									{claimFeedback.message}
								</p>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Desktop Product Details - Only visible on desktop, under pricing -->
				<ProductDetailsCard details={metadata.slice(0, 4)} class="hidden lg:block" />
			</div>
		</div>

		<!-- Mobile Product Details - Only visible on mobile, at the bottom -->
		<ProductDetailsCard details={metadata.slice(0, 4)} class="mt-8 lg:hidden" />
	</div>
</CLIWindow>

<ClaimConfirmationModal
	open={showConfirmation}
	productName={data.product.name}
	{creditCost}
	onCancel={cancelConfirmation}
	onConfirm={submitClaimFromModal}
/>

<ClaimVerificationScreen
	open={showVerification}
	product={data.product}
	{timerSeconds}
	{remainingCredits}
	onClose={closeVerification}
/>

<style>
	:global(.markdown-content) {
		color: var(--text-primary);
	}

	:global(.markdown-content h1) {
		color: var(--text-primary);
		margin-bottom: 1rem;
		margin-top: 2rem;
		font-size: 1.875rem;
		line-height: 2.25rem;
		font-weight: 700;
	}

	:global(.markdown-content h1:first-child) {
		margin-top: 0;
	}

	:global(.markdown-content h2) {
		color: var(--text-primary);
		margin-bottom: 0.75rem;
		margin-top: 1.5rem;
		font-size: 1.5rem;
		line-height: 2rem;
		font-weight: 600;
	}

	:global(.markdown-content h3) {
		color: var(--text-primary);
		margin-bottom: 0.5rem;
		margin-top: 1rem;
		font-size: 1.25rem;
		line-height: 1.75rem;
		font-weight: 600;
	}

	:global(.markdown-content p) {
		color: var(--text-primary);
		margin-bottom: 1rem;
		line-height: 1.625;
	}

	:global(.markdown-content ul),
	:global(.markdown-content ol) {
		color: var(--text-primary);
		margin-bottom: 1rem;
		margin-left: 1.5rem;
	}

	:global(.markdown-content ul > li + li),
	:global(.markdown-content ol > li + li) {
		margin-top: 0.5rem;
	}

	:global(.markdown-content li) {
		color: var(--text-primary);
	}

	:global(.markdown-content ul li) {
		list-style-type: disc;
	}

	:global(.markdown-content ol li) {
		list-style-type: decimal;
	}

	:global(.markdown-content a) {
		color: var(--primary);
		text-decoration: underline;
	}

	:global(.markdown-content a:hover) {
		color: var(--primary-dark);
	}

	:global(.markdown-content code) {
		background-color: var(--card-muted);
		color: var(--text-secondary);
		border: 1px solid var(--border);
		border-radius: 0.25rem;
		padding: 0.125rem 0.375rem;
		font-size: 0.875rem;
		line-height: 1.25rem;
	}

	:global(.markdown-content pre) {
		background-color: var(--card-muted);
		color: var(--text-primary);
		border: 1px solid var(--border);
		margin-bottom: 1rem;
		overflow-x: auto;
		border-radius: 0.25rem;
		padding: 1rem;
	}

	:global(.markdown-content pre code) {
		background-color: transparent;
		border: 0;
		padding: 0;
	}

	:global(.markdown-content blockquote) {
		color: var(--text-secondary);
		border-left: 4px solid var(--border);
		padding-left: 1rem;
		font-style: italic;
	}

	:global(.markdown-content img) {
		border: 2px solid var(--border);
		margin-top: 1rem;
		margin-bottom: 1rem;
		max-width: 100%;
	}
</style>

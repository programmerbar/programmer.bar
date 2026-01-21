<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Textarea from '$lib/components/ui/Textarea.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import MultipleSelect from '$lib/components/ui/MultipleSelect.svelte';
	import ImageUpload from '$lib/components/ui/ImageUpload.svelte';
	import { Package, Calculator, Tag, Droplets, TriangleAlert } from '@lucide/svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { SvelteSet } from 'svelte/reactivity';
	import { resolve } from '$app/paths';
	import type { ProductUpdate } from '$lib/server/db/schemas';

	interface Producer {
		id: string;
		name: string;
	}

	interface ProductType {
		id: string;
		title: string;
	}

	interface Props {
		product?: ProductUpdate & {
			productTypeIds?: Array<string>;
		};
		producers: Array<Producer>;
		productTypes: Array<ProductType>;
		isUpdate?: boolean;
	}

	let {
		product = {
			name: '',
			description: '',
			sku: '',
			ordinaryPrice: undefined,
			studentPrice: undefined,
			internalPrice: undefined,
			credits: undefined,
			volume: undefined,
			alcoholContent: undefined,
			variants: '',
			producerId: '',
			imageId: null,
			isSoldOut: false,
			productTypeIds: []
		},
		producers = [],
		productTypes = [],
		isUpdate = false
	}: Props = $props();

	let isSubmitting = $state(false);
	let submitingText = $derived.by(() => {
		return isUpdate ? 'Oppdaterer...' : 'Oppretter...';
	});
	let submitText = $derived.by(() => {
		return isUpdate ? 'Oppdater Produkt' : 'Opprett Produkt';
	});

	let formData = $state({
		name: '',
		description: '',
		sku: '',
		ordinaryPrice: undefined as number | undefined,
		studentPrice: undefined as number | undefined,
		internalPrice: undefined as number | undefined,
		credits: undefined as number | undefined,
		volume: undefined as number | undefined,
		alcoholContent: undefined as number | undefined,
		variants: '',
		producerId: '',
		imageId: null as string | null,
		isSoldOut: false
	});

	let selectedProductTypes = new SvelteSet<string>();

	const handleSubmit: SubmitFunction = () => {
		return async ({ update }) => {
			isSubmitting = true;
			await update();
			isSubmitting = false;
		};
	};

	// Update formData when product prop changes
	$effect(() => {
		if (product) {
			formData.name = product.name || '';
			formData.description = product.description || '';
			formData.sku = product.sku || '';
			formData.ordinaryPrice = product.ordinaryPrice ?? undefined;
			formData.studentPrice = product.studentPrice ?? undefined;
			formData.internalPrice = product.internalPrice ?? undefined;
			formData.credits = product.credits ?? undefined;
			formData.volume = product.volume ?? undefined;
			formData.alcoholContent = product.alcoholContent ?? undefined;
			formData.variants = (product.variants as string) || '';
			formData.producerId = product.producerId || '';
			// Only update imageId if we don't already have one set by the user
			if (!formData.imageId || formData.imageId === product.imageId) {
				formData.imageId = product.imageId || null;
			}
			formData.isSoldOut = product.isSoldOut || false;

			selectedProductTypes.clear();
			for (const typeId of product.productTypeIds || []) {
				selectedProductTypes.add(typeId);
			}
		}
	});

	const toggleProductType = (typeId: string) => {
		if (selectedProductTypes.has(typeId)) {
			selectedProductTypes.delete(typeId);
		} else {
			selectedProductTypes.add(typeId);
		}
	};

	const producerOptions = $derived(producers?.map((p) => ({ value: p.id, label: p.name })) || []);
	const productTypeOptions = $derived(
		productTypes?.map((pt) => ({ id: pt.id, label: pt.title })) || []
	);

	let studentDiscount = $derived.by(() =>
		formData.ordinaryPrice && formData.studentPrice
			? (((formData.ordinaryPrice - formData.studentPrice) / formData.ordinaryPrice) * 100).toFixed(
					1
				)
			: '0'
	);

	let internalDiscount = $derived.by(() =>
		formData.ordinaryPrice && formData.internalPrice
			? (
					((formData.ordinaryPrice - formData.internalPrice) / formData.ordinaryPrice) *
					100
				).toFixed(1)
			: '0'
	);
</script>

<div class="p-6">
	<form method="POST" class="space-y-8" use:enhance={handleSubmit}>
		{#if product?.id}
			<input type="hidden" name="id" value={product.id} />
		{/if}
		<input type="hidden" name="imageId" value={formData.imageId || ''} />
		<input type="hidden" name="isSoldOut" value={formData.isSoldOut.toString()} />
		<div class="grid grid-cols-1 gap-8 xl:grid-cols-3">
			<!-- Basic Information -->
			<div class="space-y-6 xl:col-span-2">
				<div>
					<div class="mb-4 flex items-center gap-2">
						<Package class="h-5 w-5 text-gray-400" />
						<h3 class="text-lg font-medium text-gray-900">Grunnleggende informasjon</h3>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<label for="name" class="mb-2 block text-sm font-medium text-gray-700">
								Produktnavn *
							</label>
							<Input
								id="name"
								name="name"
								bind:value={formData.name}
								required
								placeholder="F.eks. Lervig Lucky Jack IPA"
								class="w-full"
							/>
						</div>

						<div class="sm:col-span-2">
							<label for="description" class="mb-2 block text-sm font-medium text-gray-700">
								Beskrivelse
							</label>
							<Textarea
								id="description"
								name="description"
								bind:value={formData.description}
								placeholder="Beskriv produktet, smak, egenskaper..."
								rows={3}
								class="w-full"
							/>
						</div>

						<div>
							<label for="sku" class="mb-2 block text-sm font-medium text-gray-700">
								Frontline ID
							</label>
							<Input
								id="sku"
								name="sku"
								bind:value={formData.sku}
								placeholder="ID fra kassasystem"
								class="w-full"
							/>
						</div>

						<div>
							<label for="producerId" class="mb-2 block text-sm font-medium text-gray-700">
								Produsent
							</label>
							<Select
								id="producerId"
								name="producerId"
								bind:value={formData.producerId}
								options={producerOptions}
								placeholder="Velg produsent"
								class="w-full"
							/>
							{#if producerOptions.length === 0}
								<p class="mt-1 text-sm text-amber-600">
									<a href={resolve('/portal/admin/cms/producers/new')} class="underline">
										Legg til produsent først
									</a>
								</p>
							{/if}
						</div>
					</div>
				</div>

				<!-- Product Details -->
				<div>
					<div class="mb-4 flex items-center gap-2">
						<Droplets class="h-5 w-5 text-gray-400" />
						<h3 class="text-lg font-medium text-gray-900">Produktdetaljer</h3>
					</div>
					<p class="mb-4 text-sm text-gray-600">
						Fyll ut disse feltene kun for drikke. La stå tomme for snacks og andre produkter.
					</p>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div>
							<label for="volume" class="mb-2 block text-sm font-medium text-gray-700">
								Volum (liter)
							</label>
							<Input
								id="volume"
								name="volume"
								type="number"
								step="0.01"
								min="0"
								bind:value={formData.volume}
								placeholder="0.5"
								class="w-full"
							/>
						</div>

						<div>
							<label for="alcoholContent" class="mb-2 block text-sm font-medium text-gray-700">
								Alkohol (%)
							</label>
							<Input
								id="alcoholContent"
								name="alcoholContent"
								type="number"
								step="0.1"
								min="0"
								max="100"
								bind:value={formData.alcoholContent}
								placeholder="4.7"
								class="w-full"
							/>
						</div>

						<div>
							<label for="credits" class="mb-2 block text-sm font-medium text-gray-700">
								Credits (1-5)
							</label>
							<Input
								id="credits"
								name="credits"
								type="number"
								min="1"
								max="5"
								bind:value={formData.credits}
								placeholder="3"
								class="w-full"
							/>
						</div>
					</div>

					<div class="mt-4">
						<div class="mb-4 flex items-center gap-2">
							<TriangleAlert class="h-5 w-5 text-gray-400" />
							<h3 class="text-lg font-medium text-gray-900">Status</h3>
						</div>
						<div class="flex items-center gap-3">
							<input
								id="isSoldOut"
								type="checkbox"
								bind:checked={formData.isSoldOut}
								class="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
							/>
							<label for="isSoldOut" class="text-sm font-medium text-gray-700"> Utsolgt </label>
						</div>
					</div>

					<div class="mt-4">
						<label for="variants" class="mb-2 block text-sm font-medium text-gray-700">
							Varianter
						</label>
						<Input
							id="variants"
							name="variants"
							bind:value={formData.variants}
							placeholder="Original, Mango, Sitrus (skill med komma)"
							class="w-full"
						/>
						<p class="mt-1 text-sm text-gray-500">
							Forskjellige smaker eller varianter, separert med komma
						</p>
					</div>
				</div>

				<!-- Pricing -->
				<div>
					<div class="mb-4 flex items-center gap-2">
						<Calculator class="h-5 w-5 text-gray-400" />
						<h3 class="text-lg font-medium text-gray-900">Prissetting</h3>
					</div>

					<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<div>
							<label for="ordinaryPrice" class="mb-2 block text-sm font-medium text-gray-700">
								Ordinærpris *
							</label>
							<Input
								id="ordinaryPrice"
								name="ordinaryPrice"
								type="number"
								min="0"
								bind:value={formData.ordinaryPrice}
								required
								placeholder="85"
								class="w-full"
							/>
							<p class="mt-1 text-sm text-gray-500">Full pris for eksterne</p>
						</div>

						<div>
							<label for="studentPrice" class="mb-2 block text-sm font-medium text-gray-700">
								Studentpris *
							</label>
							<Input
								id="studentPrice"
								name="studentPrice"
								type="number"
								min="0"
								bind:value={formData.studentPrice}
								required
								placeholder="65"
								class="w-full"
							/>
							<p class="mt-1 text-sm text-gray-500">
								Pris for studenter ({studentDiscount}% rabatt)
							</p>
						</div>

						<div>
							<label for="internalPrice" class="mb-2 block text-sm font-medium text-gray-700">
								Internpris *
							</label>
							<Input
								id="internalPrice"
								name="internalPrice"
								type="number"
								min="0"
								bind:value={formData.internalPrice}
								required
								placeholder="45"
								class="w-full"
							/>
							<p class="mt-1 text-sm text-gray-500">
								Pris for interne ({internalDiscount}% rabatt)
							</p>
						</div>
					</div>
				</div>

				<!-- Categories -->
				<div>
					<div class="mb-4 flex items-center gap-2">
						<Tag class="h-5 w-5 text-gray-400" />
						<h3 class="text-lg font-medium text-gray-900">Kategorisering</h3>
					</div>

					<div>
						<label for="productTypeIds" class="mb-2 block text-sm font-medium text-gray-700">
							Produkttyper
						</label>
						<MultipleSelect
							selected={Array.from(selectedProductTypes)}
							onToggle={toggleProductType}
							options={productTypeOptions}
							placeholder="Velg produkttyper"
						/>
						{#each Array.from(selectedProductTypes) as typeId (typeId)}
							<input type="hidden" name="productTypeIds" value={typeId} />
						{/each}
						{#if productTypeOptions.length === 0}
							<p class="mt-1 text-sm text-amber-600">
								<a href={resolve('/portal/admin/cms/product-types/new')} class="underline">
									Legg til produkttyper først
								</a>
							</p>
						{/if}
					</div>
				</div>

				<!-- Image Upload -->
				<div>
					<div class="mb-4 flex items-center gap-2">
						<Package class="h-5 w-5 text-gray-400" />
						<h3 class="text-lg font-medium text-gray-900">Produktbilde</h3>
					</div>

					<ImageUpload
						type="product"
						currentImageId={formData.imageId}
						onUpload={(imageId) => (formData.imageId = imageId)}
						onRemove={() => (formData.imageId = null)}
					/>
				</div>
			</div>

			<!-- Preview & Validation -->
			<div class="space-y-6">
				<div>
					<h3 class="mb-4 text-lg font-medium text-gray-900">Validering</h3>
					<div class="space-y-2 text-sm">
						<div class="flex items-center gap-2">
							<div
								class={`h-2 w-2 rounded-full ${formData.name ? 'bg-green-400' : 'bg-gray-300'}`}
							></div>
							<span class={formData.name ? 'text-green-700' : 'text-gray-500'}> Produktnavn </span>
						</div>
						<div class="flex items-center gap-2">
							<div
								class={`h-2 w-2 rounded-full ${formData.ordinaryPrice ? 'bg-green-400' : 'bg-gray-300'}`}
							></div>
							<span class={formData.ordinaryPrice ? 'text-green-700' : 'text-gray-500'}>
								Ordinærpris
							</span>
						</div>
						<div class="flex items-center gap-2">
							<div
								class={`h-2 w-2 rounded-full ${formData.studentPrice ? 'bg-green-400' : 'bg-gray-300'}`}
							></div>
							<span class={formData.studentPrice ? 'text-green-700' : 'text-gray-500'}>
								Studentpris
							</span>
						</div>
						<div class="flex items-center gap-2">
							<div
								class={`h-2 w-2 rounded-full ${formData.internalPrice ? 'bg-green-400' : 'bg-gray-300'}`}
							></div>
							<span class={formData.internalPrice ? 'text-green-700' : 'text-gray-500'}>
								Internpris
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex items-center justify-end border-t border-gray-200 pt-6">
			<div class="flex gap-3">
				<Button
					type="submit"
					disabled={isSubmitting ||
						!formData.name ||
						!formData.ordinaryPrice ||
						!formData.studentPrice ||
						!formData.internalPrice}
					class="min-w-32"
				>
					{isSubmitting ? submitingText : submitText}
				</Button>
			</div>
		</div>
	</form>
</div>

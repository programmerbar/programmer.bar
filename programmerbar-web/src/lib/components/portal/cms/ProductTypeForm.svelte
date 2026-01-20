<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface ProductType {
		id?: string;
		title: string;
	}

	interface Props {
		productType?: ProductType;
		isUpdate?: boolean;
	}

	let { productType = { title: '' }, isUpdate = false }: Props = $props();

	let isSubmitting = $state(false);
	let submitingText = $derived.by(() =>
		isSubmitting ? 'Lagrer...' : isUpdate ? 'Oppdater' : 'Opprett'
	);
	let submitText = $derived.by(() => (isUpdate ? 'Oppdater type' : 'Opprett type'));

	let titleValue = $state('');

	// Update titleValue when productType prop changes
	$effect(() => {
		if (productType) {
			titleValue = productType.title || '';
		}
	});

	const handleSubmit: SubmitFunction = () => {
		return async ({ update }) => {
			isSubmitting = true;
			await update();
			isSubmitting = false;
		};
	};
</script>

<div class="p-6">
	<form method="POST" class="space-y-6" use:enhance={handleSubmit}>
		{#if productType?.id}
			<input type="hidden" name="id" value={productType.id} />
		{/if}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<div>
				<h3 class="mb-4 text-lg font-medium text-gray-900">Grunnleggende informasjon</h3>

				<div>
					<label for="title" class="mb-2 block text-sm font-medium text-gray-700"> Tittel * </label>
					<Input
						id="title"
						name="title"
						bind:value={titleValue}
						required
						placeholder="F.eks. Øl, Snacks, Cocktails"
						class="w-full"
					/>
					<p class="mt-1 text-sm text-gray-500">Navnet på kategorien som vil vises til brukere</p>
				</div>
			</div>

			<div>
				<h3 class="mb-4 text-lg font-medium text-gray-900">Tips</h3>
				<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
					<ul class="space-y-2 text-sm text-blue-800">
						<li>• Bruk enkle, beskrivende navn</li>
						<li>• Unngå for spesifikke kategorier</li>
						<li>• Tenk på hvordan kunder søker</li>
						<li>• Produkter kan ha flere typer</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex items-center justify-end border-t border-gray-200 pt-6">
			<div class="flex gap-3">
				<Button type="submit" disabled={isSubmitting} class="min-w-32">
					{isSubmitting ? submitingText : submitText}
				</Button>
			</div>
		</div>
	</form>
</div>

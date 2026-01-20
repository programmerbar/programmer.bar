<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import ImageUpload from '$lib/components/ui/ImageUpload.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface Producer {
		id?: string;
		name: string;
		imageId?: string | null;
	}

	interface Props {
		producer?: Producer;
		isUpdate?: boolean;
	}

	let { producer = { name: '', imageId: null }, isUpdate = false }: Props = $props();

	let isSubmitting = $state(false);
	let submitingText = $derived.by(() =>
		isSubmitting ? 'Lagrer...' : isUpdate ? 'Oppdater' : 'Opprett'
	);
	let submitText = $derived.by(() => (isUpdate ? 'Oppdater Produsent' : 'Opprett Produsent'));

	let formData = $state({
		name: '',
		imageId: null as string | null
	});

	// Update formData when producer prop changes
	$effect(() => {
		if (producer) {
			formData.name = producer.name || '';
			formData.imageId = producer.imageId || null;
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
		{#if producer?.id}
			<input type="hidden" name="id" value={producer.id} />
		{/if}
		{#if formData.imageId}
			<input type="hidden" name="imageId" value={formData.imageId} />
		{/if}
		<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Basic Information -->
			<div class="space-y-6">
				<div>
					<h3 class="mb-4 text-lg font-medium text-gray-900">Grunnleggende informasjon</h3>

					<div class="space-y-4">
						<div>
							<label for="name" class="mb-2 block text-sm font-medium text-gray-700">
								Navn *
							</label>
							<Input
								id="name"
								name="name"
								bind:value={formData.name}
								required
								placeholder="F.eks. Lervig Aktiebryggeri"
								class="w-full"
							/>
							<p class="mt-1 text-sm text-gray-500">Det offisielle navnet på produsenten</p>
						</div>
					</div>
				</div>

				<div>
					<h3 class="mb-4 text-lg font-medium text-gray-900">Logo</h3>
					<ImageUpload
						type="producer"
						currentImageId={formData.imageId}
						onUpload={(imageId) => (formData.imageId = imageId)}
						onRemove={() => (formData.imageId = null)}
					/>
				</div>
			</div>

			<!-- Preview/Help -->
			<div class="space-y-6">
				<div>
					<h3 class="mb-4 text-lg font-medium text-gray-900">Tips</h3>
					<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
						<ul class="space-y-2 text-sm text-blue-800">
							<li>• Bruk det offisielle navnet på bryggeriet</li>
							<li>• Sjekk stavemåten før du lagrer</li>
							<li>• Produsenten kan knyttes til flere produkter</li>
						</ul>
					</div>
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

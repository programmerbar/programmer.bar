<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import { initials } from '$lib/utils/strings.js';
	import { enhance } from '$app/forms';
	import { ArrowLeft } from '@lucide/svelte';
	import type { User } from '$lib/server/db/schemas/index.js';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import type { SubmitFunction } from './$types.js';

	let { data } = $props();
	let user = $derived(data.user as User);

	let editForm = $state({
		altEmail: user.altEmail || '',
		phone: user.phone || ''
	});

	$effect(() => {
		editForm.altEmail = data.user.altEmail || '';
		editForm.phone = data.user.phone || '';
	});

	let isSubmitting = $state(false);

	const handleSave: SubmitFunction = () => {
		isSubmitting = true;
		return async ({ result, update }) => {
			isSubmitting = false;
			// Form will redirect on success, so no need to handle success case
			if (result.type === 'failure') {
				console.error('Failed to save profile');
			}
			await update();
		};
	};
</script>

<svelte:head>
	<title>Rediger Profil</title>
</svelte:head>

<div class="space-y-10">
	<!-- Header with back button -->
	<div class="flex items-center gap-4">
		<ButtonLink href="/portal/profil" intent="outline" size="square">
			<ArrowLeft class="h-5 w-5" />
		</ButtonLink>
		<Heading>Rediger Profil</Heading>
	</div>

	<!-- Profile overview (read-only) -->
	<div class="bg-portal-card border-portal-border rounded-lg border p-4 sm:p-6">
		<div class="flex items-center gap-4">
			<div
				class="dark:bg-portal-hover flex h-16 w-16 items-center justify-center rounded-full bg-gray-300"
			>
				<span class="text-2xl font-semibold text-gray-700 dark:text-gray-300">
					{initials(user.name)}
				</span>
			</div>
			<div class="min-w-0 flex-1">
				<Heading class="mb-1 truncate">{user.name}</Heading>
				<div class="flex items-center gap-3">
					<Pill variant={user.role === 'board' ? 'purple' : 'blue'}>
						{user.role === 'board' ? 'Styret' : 'Frivillig'}
					</Pill>
				</div>
			</div>
		</div>
	</div>

	<!-- Edit form -->
	<div class="bg-portal-card border-portal-border rounded-lg border">
		<div class="px-6 py-4">
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
				Rediger informasjon
			</h3>

			<form method="POST" action="?/save" use:enhance={handleSave} class="space-y-6">
				<div class="space-y-4">
					<!-- Read-only fields -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div
							class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
						>
							<span class="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400"
								>Navn</span
							>
							<p class="text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Kan ikke endres</p>
						</div>
						<div
							class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
						>
							<span class="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400"
								>Hovedepost</span
							>
							<p class="text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
							<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Kan ikke endres</p>
						</div>
					</div>

					<!-- Editable fields -->
					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div
							class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-white p-4"
						>
							<label
								for="edit-email"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
							>
								Alternativ e-post
							</label>
							<Input
								id="edit-email"
								name="altEmail"
								bind:value={editForm.altEmail}
								type="email"
								class="w-full border"
								placeholder="din.alternativ@epost.no"
							/>
						</div>
						<div
							class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-white p-4"
						>
							<label
								for="edit-phone"
								class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
							>
								Telefon
							</label>
							<Input
								id="edit-phone"
								name="phone"
								bind:value={editForm.phone}
								type="tel"
								class="w-full border"
								placeholder="+47 123 45 678"
							/>
						</div>
					</div>
				</div>

				<!-- Action buttons -->
				<div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
					<ButtonLink intent="outline" href="/portal/profil" class="w-full sm:order-1 sm:w-auto">
						Avbryt
					</ButtonLink>
					<Button
						type="submit"
						intent="primary"
						disabled={isSubmitting}
						class="w-full sm:order-2 sm:w-auto"
					>
						{isSubmitting ? 'Lagrer...' : 'Lagre endringer'}
					</Button>
				</div>
			</form>
		</div>
	</div>
</div>

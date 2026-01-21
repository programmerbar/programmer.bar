<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import { initials } from '$lib/utils/strings.js';
	import { enhance } from '$app/forms';
	import { ArrowLeft, UserCog } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import type { User } from '$lib/server/db/schemas/index.js';
	import type { SubmitFunction } from './$types.js';

	let { data } = $props();
	let user = $derived(data.user as User);

	let editForm = $state({
		role: user.role,
		phone: user.phone || '',
		canRefer: user.canRefer ?? true
	});

	$effect(() => {
		editForm.role = data.user.role;
		editForm.phone = data.user.phone || '';
		editForm.canRefer = data.user.canRefer ?? true;
	});

	let isSubmitting = $state(false);

	const handleSave: SubmitFunction = () => {
		isSubmitting = true;
		return async ({ result, update }) => {
			isSubmitting = false;
			if (result.type === 'failure') {
				console.error('Failed to save user');
			}
			await update();
		};
	};
</script>

<svelte:head>
	<title>Rediger {user.name} - Admin</title>
</svelte:head>

<div class="space-y-10">
	<!-- Header with back button -->
	<div class="flex items-center gap-4">
		<ButtonLink
			href={resolve('/(portal)/portal/admin/bruker/[id]', { id: user.id })}
			intent="outline"
			size="square"
		>
			<ArrowLeft class="h-5 w-5" />
		</ButtonLink>
		<div>
			<Heading>Rediger bruker</Heading>
			<p class="mt-1 text-gray-600 dark:text-gray-300">
				Administrer {user.name}s profil og tillatelser
			</p>
		</div>
	</div>

	<!-- User overview (read-only) -->
	<div class="bg-portal-card border-portal-border rounded-lg border p-4 sm:p-6">
		<div class="flex items-center gap-4">
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
			>
				<span class="text-2xl font-semibold text-blue-600 dark:text-blue-400">
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
		<div class="border-portal-border border-b px-6 py-4">
			<div class="flex items-center gap-2">
				<UserCog class="h-5 w-5 text-gray-600 dark:text-gray-300" />
				<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
					Rediger brukerdetaljer
				</h3>
			</div>
		</div>

		<form method="POST" action="?/save" use:enhance={handleSave} class="space-y-6 p-6">
			<div class="space-y-6">
				<!-- Read-only fields -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div
						class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
					>
						<span class="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400">Navn</span
						>
						<p class="text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Kan ikke endres</p>
					</div>
					<div
						class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-gray-50 p-4"
					>
						<span class="mb-1 block text-sm font-medium text-gray-500 dark:text-gray-400"
							>E-post</span
						>
						<p class="text-sm text-gray-900 dark:text-gray-100">{user.altEmail || user.email}</p>
						<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Kan ikke endres</p>
					</div>
				</div>

				<!-- Editable fields -->
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
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
							placeholder="+47 123 45 678"
							class="w-full border"
						/>
					</div>

					<div
						class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-white p-4"
					>
						<div class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Rolle</div>
						<div class="flex items-center gap-3">
							<label class="flex cursor-pointer items-center">
								<input
									type="radio"
									name="role"
									value="normal"
									class="peer sr-only"
									bind:group={editForm.role}
								/>
								<div
									class="dark:border-portal-border dark:hover:bg-portal-hover flex items-center justify-center rounded-lg border px-4 py-2 text-sm transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 hover:bg-gray-50 dark:text-gray-300 dark:peer-checked:border-blue-400 dark:peer-checked:bg-blue-950/50 dark:peer-checked:text-blue-300"
								>
									Frivillig
								</div>
							</label>

							<label class="flex cursor-pointer items-center">
								<input
									type="radio"
									name="role"
									value="board"
									class="peer sr-only"
									bind:group={editForm.role}
								/>
								<div
									class="dark:border-portal-border dark:hover:bg-portal-hover flex items-center justify-center rounded-lg border px-4 py-2 text-sm transition-colors peer-checked:border-purple-500 peer-checked:bg-purple-50 peer-checked:text-purple-700 hover:bg-gray-50 dark:text-gray-300 dark:peer-checked:border-purple-400 dark:peer-checked:bg-purple-950/50 dark:peer-checked:text-purple-300"
								>
									Styret
								</div>
							</label>
						</div>
					</div>
				</div>

				<!-- Can Refer Setting -->
				<div
					class="dark:border-portal-border dark:bg-portal-hover rounded-lg border border-gray-200 bg-white p-4"
				>
					<div class="flex items-center justify-between">
						<div>
							<div class="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
								Kan referere nye brukere
							</div>
							<p class="text-xs text-gray-500 dark:text-gray-400">
								Tillater brukeren å referere nye frivillige til Programmerbar
							</p>
						</div>
						<label class="flex cursor-pointer items-center gap-2">
							<input
								type="checkbox"
								name="canRefer"
								bind:checked={editForm.canRefer}
								class="dark:border-portal-border dark:bg-portal-hover h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:checked:bg-blue-600 dark:focus:ring-blue-500"
							/>
							<span class="text-sm font-medium text-gray-900 dark:text-gray-100">
								{editForm.canRefer ? 'Ja' : 'Nei'}
							</span>
						</label>
					</div>
				</div>
			</div>

			<!-- Action buttons -->
			<div class="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<ButtonLink
					intent="outline"
					href={resolve('/(portal)/portal/admin/bruker/[id]', { id: user.id })}
					class="w-full sm:order-1 sm:w-auto"
				>
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

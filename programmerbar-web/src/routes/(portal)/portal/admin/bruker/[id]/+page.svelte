<script lang="ts">
	import Heading from '$lib/components/ui/Heading.svelte';
	import ButtonLink from '$lib/components/ui/ButtonLink.svelte';
	import Pill from '$lib/components/ui/Pill.svelte';
	import TrainingChecklist from '$lib/components/portal/Training.svelte';
	import AddBeersModal from '$lib/components/portal/AddBeersModal.svelte';
	import type { User } from '$lib/server/db/schemas/index.js';
	import { initials, mailto } from '$lib/utils/strings.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import {
		ArrowLeft,
		UserCog,
		SquarePen,
		Mail,
		Beer,
		ClipboardList,
		CircleCheck,
		Trash2
	} from '@lucide/svelte';
	import Input from '$lib/components/ui/Input.svelte';

	let { data } = $props();
	let user = $state(data.user as User);

	let showDeleteConfirm = $state(false);
	let showAddBeers = $state(false);
	let showTrainingChecklist = $state(false);
	let deleteConfirmName = $state('');

	let userHasCompletedTraining = $state(data.user.isTrained || false);

	$effect(() => {
		user = data.user as User;
		userHasCompletedTraining = data.user.isTrained || false;
	});

	let toastMessage = $state('');

	function showToast(message: string) {
		toastMessage = message;
		setTimeout(() => {
			toastMessage = '';
		}, 3000);
	}

	function onTrainingSave(data: { completionStatus: { isComplete: boolean } }) {
		if (data.completionStatus.isComplete) {
			userHasCompletedTraining = true;
			user.isTrained = true;
			showTrainingChecklist = false;
			showToast(`${user.name} har fullført opplæringen! ✅`);
		}
	}
</script>

<svelte:head>
	<title>Admin - {user.name}</title>
</svelte:head>

<div class="space-y-10">
	<!-- Header with back button -->
	<div class="flex items-center gap-4">
		<ButtonLink href="/portal/admin" intent="outline" size="square">
			<ArrowLeft class="h-5 w-5" />
		</ButtonLink>
		<div>
			<Heading>Brukerdetaljer</Heading>
			<p class="mt-1 text-gray-600 dark:text-gray-300">Vis og administrer {user.name}s profil</p>
		</div>
	</div>

	<!-- User overview -->
	<div class="bg-portal-card border-portal-border rounded-lg border p-4 sm:p-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<div
					class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30"
				>
					<span class="text-2xl font-semibold text-blue-600 dark:text-blue-400">
						{initials(data.user.name)}
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
			<ButtonLink
				href={`/portal/admin/bruker/${user.id}/rediger`}
				intent="primary"
				class="flex items-center gap-2"
			>
				<SquarePen class="h-4 w-4" />
				Rediger
			</ButtonLink>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<div class="space-y-6 lg:col-span-2">
			<div class="bg-portal-card border-portal-border rounded-lg border">
				<div class="border-portal-border border-b px-6 py-4">
					<div class="flex items-center gap-2">
						<UserCog class="h-5 w-5 text-gray-600 dark:text-gray-300" />
						<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Brukerinformasjon
						</h3>
					</div>
				</div>
				<div class="p-6">
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Navn</dt>
							<dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">{user.name}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500 dark:text-gray-400">E-post</dt>
							<dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
								{user.altEmail || user.email}
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Telefon</dt>
							<dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
								{user.phone || 'Ikke oppgitt'}
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Rolle</dt>
							<dd class="mt-1">
								<Pill variant={user.role === 'board' ? 'purple' : 'blue'}>
									{user.role === 'board' ? 'Styret' : 'Frivillig'}
								</Pill>
							</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Kan referere</dt>
							<dd class="mt-1">
								<Pill variant={user.canRefer ? 'green' : 'red'}>
									{user.canRefer ? 'Ja' : 'Nei'}
								</Pill>
							</dd>
						</div>
					</div>
				</div>
			</div>

			<div class="bg-portal-card border-portal-border rounded-lg border">
				<div class="border-portal-border border-b px-6 py-4">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Verv stats</h3>
				</div>
				<div class="p-6">
					<div class="space-y-3">
						<div
							class="dark:border-portal-border flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
						>
							<div class="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-400"></div>
							<div class="flex-1">
								<p class="text-sm text-gray-900 dark:text-gray-100">Totale referreinger</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{data.referrals.totalReferrals}
								</p>
							</div>
						</div>
						<div
							class="dark:border-portal-border flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
						>
							<div class="mt-2 h-2 w-2 shrink-0 rounded-full bg-green-400"></div>
							<div class="flex-1">
								<p class="text-sm text-gray-900 dark:text-gray-100">Godkjente referreninger</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{data.referrals.completedReferrals}
								</p>
							</div>
						</div>
						<div
							class="dark:border-portal-border flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
						>
							<div class="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-400"></div>
							<div class="flex-1">
								<p class="text-sm text-gray-900 dark:text-gray-100">Ventende referreringer</p>
								<p class="text-xs text-gray-500 dark:text-gray-400">
									{data.referrals.pendingReferrals}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="space-y-6">
			<div class="bg-portal-card border-portal-border rounded-lg border">
				<div class="border-portal-border border-b px-6 py-4">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Statistikk</h3>
				</div>
				<div class="space-y-4 p-6">
					<div class="flex justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-300">Antall ganger stått (sem)</span>
						<span class="text-sm font-semibold text-gray-900 dark:text-gray-100"
							>{data.timesVolunteered || 0}</span
						>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-300">Antall Bonger</span>
						<span class="text-sm font-semibold text-gray-900 dark:text-gray-100"
							>{data.unclaimedBeers || 0}</span
						>
					</div>
					<div class="flex justify-between">
						<span class="text-sm text-gray-600 dark:text-gray-300">Kommende arrangement</span>
						<span class="text-sm font-semibold text-gray-900 dark:text-gray-100">
							{data.shifts?.length > 0 ? data.shifts[0].event?.name : 'Ingen'}
						</span>
					</div>
				</div>
			</div>

			<div class="bg-portal-card border-portal-border rounded-lg border">
				<div class="border-portal-border border-b px-6 py-4">
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Handlinger</h3>
				</div>
				<div class="flex flex-col gap-2 p-6">
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						class="hover:bg-portal-hover flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors dark:text-gray-300"
						href={mailto(data.user.altEmail || data.user.email)}
					>
						<Mail class="h-4 w-4" />
						Send e-post
					</a>
					<button
						class="hover:bg-portal-hover flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm text-gray-700 transition-colors dark:text-gray-300"
						onclick={() => (showAddBeers = true)}
					>
						<Beer class="h-4 w-4" />
						Legg til / Fjern bonger
					</button>
					<button
						class="hover:bg-portal-hover flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm transition-colors {userHasCompletedTraining
							? 'text-green-600 dark:text-green-400'
							: 'text-gray-700 dark:text-gray-300'}"
						onclick={() => (showTrainingChecklist = true)}
					>
						{#if userHasCompletedTraining}
							<CircleCheck class="h-4 w-4" />
							Opplæring fullført
						{:else}
							<ClipboardList class="h-4 w-4" />
							Start opplæring
						{/if}
					</button>
					<div class="dark:border-portal-border border-t border-gray-200 pt-2">
						<button
							class="flex w-full items-center gap-2 rounded-md px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
							onclick={() => (showDeleteConfirm = true)}
						>
							<Trash2 class="h-4 w-4" />
							Slett bruker
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Training Checklist Component -->
<TrainingChecklist
	userId={user.id}
	userName={user.name}
	isOpen={showTrainingChecklist}
	onclose={() => (showTrainingChecklist = false)}
	onsave={onTrainingSave}
/>

<!-- Add Beers Modal Component -->
<AddBeersModal
	isOpen={showAddBeers}
	userName={user.name}
	onclose={() => (showAddBeers = false)}
	onsuccess={() => window.location.reload()}
/>

{#if showDeleteConfirm}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-xs dark:bg-black/40"
	>
		<div
			class="bg-portal-card border-portal-border mx-4 w-full max-w-md rounded-lg border p-6 shadow-lg"
		>
			<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Slett bruker</h3>
			<p class="mb-4 text-sm text-gray-600 dark:text-gray-300">
				Er du sikker på at du vil slette <strong>{user.name}</strong>? Skriv inn brukerens navn for
				å bekrefte.
			</p>
			<form
				method="POST"
				action="?/deleteUser"
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							showDeleteConfirm = false;
							deleteConfirmName = '';
							showToast((result.data as { message: string }).message);
							setTimeout(() => {
								goto(resolve('/portal/admin'));
							}, 2000);
						} else {
							console.error('Failed to delete user');
						}
					};
				}}
			>
				<div class="mb-4">
					<Input
						name="confirmDelete"
						bind:value={deleteConfirmName}
						placeholder={user.name}
						class="w-full"
					/>
				</div>
				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => {
							showDeleteConfirm = false;
							deleteConfirmName = '';
						}}
						class="dark:bg-portal-hover rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-[#222222]"
					>
						Avbryt
					</button>
					<button
						type="submit"
						disabled={deleteConfirmName !== user.name}
						class="rounded-md bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700"
					>
						Slett bruker
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if toastMessage}
	<div
		class="fixed right-4 bottom-4 z-50 rounded-md border border-green-400 bg-green-100 px-4 py-3 text-green-700 shadow-lg dark:border-green-700 dark:bg-green-950/50 dark:text-green-300"
	>
		{toastMessage}
	</div>
{/if}
